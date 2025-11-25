"""
GitHub OAuth integration views
"""
from django.shortcuts import redirect
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
import requests


@api_view(['GET'])
@permission_classes([])  # No authentication required
def github_connect(request):
    """
    Step 1: Redirect user to GitHub OAuth authorization page
    """
    import json
    import base64
    from rest_framework.authtoken.models import Token
    from rest_framework.permissions import AllowAny
    
    # Get token from query parameter
    token_key = request.GET.get('token', '')
    
    if not token_key:
        return Response(
            {'error': 'Token not provided'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    # Verify JWT token and get user
    try:
        from rest_framework_simplejwt.tokens import AccessToken
        from accounts.models import CustomUser
        
        # Decode JWT token
        access_token = AccessToken(token_key)
        user_id = access_token['user_id']
        user = CustomUser.objects.get(id=user_id)
    except Exception as e:
        return Response(
            {'error': f'Invalid token: {str(e)}'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    # Create state with user ID for callback
    state_data = {
        'user_id': user.id,
    }
    state = base64.b64encode(json.dumps(state_data).encode()).decode()
    
    github_auth_url = (
        f"https://github.com/login/oauth/authorize?"
        f"client_id={settings.GITHUB_CLIENT_ID}&"
        f"scope=repo,user&"
        f"redirect_uri={settings.GITHUB_REDIRECT_URI}&"
        f"state={state}"  # Pass encoded state with user ID
    )
    return redirect(github_auth_url)


@api_view(['GET'])
@permission_classes([])  # No authentication required for callback
def github_callback(request):
    """
    Step 2: Handle GitHub OAuth callback
    Exchange authorization code for access token
    """
    import json
    import base64
    from django.contrib.auth import get_user_model
    
    code = request.GET.get('code')
    state = request.GET.get('state')
    
    if not code:
        return Response(
            {'error': 'No authorization code provided'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Decode state to get user_id
    try:
        state_data = json.loads(base64.b64decode(state).decode())
        user_id = state_data.get('user_id')
    except:
        return Response(
            {'error': 'Invalid state parameter'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Exchange code for access token
    token_response = requests.post(
        'https://github.com/login/oauth/access_token',
        data={
            'client_id': settings.GITHUB_CLIENT_ID,
            'client_secret': settings.GITHUB_CLIENT_SECRET,
            'code': code,
            'redirect_uri': settings.GITHUB_REDIRECT_URI,
        },
        headers={'Accept': 'application/json'}
    )
    
    if token_response.status_code != 200:
        return Response(
            {'error': 'Failed to exchange code for token'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    token_data = token_response.json()
    access_token = token_data.get('access_token')
    
    if not access_token:
        return Response(
            {'error': 'No access token received'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Get user's GitHub profile
    user_response = requests.get(
        'https://api.github.com/user',
        headers={'Authorization': f'token {access_token}'}
    )
    
    if user_response.status_code != 200:
        return Response(
            {'error': 'Failed to fetch GitHub profile'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    github_data = user_response.json()
    
    # Get user from database using user_id from state
    from accounts.models import CustomUser
    try:
        user = CustomUser.objects.get(id=user_id)
    except CustomUser.DoesNotExist:
        return Response(
            {'error': 'User not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Save GitHub data to user profile
    user.github_username = github_data.get('login')
    user.github_access_token = access_token
    user.github_avatar = github_data.get('avatar_url', '')
    user.github_connected = True
    user.save()
    
    # Redirect to frontend settings page with success message
    frontend_url = settings.FRONTEND_URL if hasattr(settings, 'FRONTEND_URL') else 'http://localhost:3000'
    return redirect(f"{frontend_url}/student/settings?github=connected")


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def github_disconnect(request):
    """
    Disconnect GitHub account
    """
    user = request.user
    user.github_username = ''
    user.github_access_token = ''
    user.github_avatar = ''
    user.github_connected = False
    user.save()
    
    return Response({
        'message': 'GitHub account disconnected successfully'
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def github_status(request):
    """
    Check GitHub connection status
    """
    user = request.user
    return Response({
        'connected': user.github_connected,
        'username': user.github_username,
        'avatar': user.github_avatar,
    })

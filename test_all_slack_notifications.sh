#!/bin/bash

echo "🔔 Testing All Slack Notification Types..."
echo ""

# Test 1: Basic message
echo "1️⃣ Testing basic message..."
sudo docker exec apranova_backend python manage.py shell -c "
from utils.slack import send_slack_message
send_slack_message('📝 Test 1: Basic message')
print('✅ Basic message sent')
"
sleep 2

# Test 2: New submission notification
echo ""
echo "2️⃣ Testing new submission notification..."
sudo docker exec apranova_backend python manage.py shell -c "
from curriculum.models import Submission
from utils.slack import notify_new_submission
submission = Submission.objects.first()
if submission:
    notify_new_submission(submission)
    print('✅ Submission notification sent')
else:
    print('⚠️  No submissions found')
"
sleep 2

# Test 3: PR created notification
echo ""
echo "3️⃣ Testing PR created notification..."
sudo docker exec apranova_backend python manage.py shell -c "
from accounts.models import CustomUser
from curriculum.models import Project
from utils.slack import notify_pr_created
student = CustomUser.objects.filter(role='STUDENT').first()
project = Project.objects.first()
if student and project:
    notify_pr_created(student, project, 'https://github.com/ApraNova-bootcamp/test-repo/pull/1')
    print('✅ PR notification sent')
else:
    print('⚠️  No student or project found')
"
sleep 2

# Test 4: PR merged notification
echo ""
echo "4️⃣ Testing PR merged notification..."
sudo docker exec apranova_backend python manage.py shell -c "
from accounts.models import CustomUser
from curriculum.models import Project
from utils.slack import notify_pr_merged
student = CustomUser.objects.filter(role='STUDENT').first()
project = Project.objects.first()
if student and project:
    notify_pr_merged(student, project)
    print('✅ PR merged notification sent')
else:
    print('⚠️  No student or project found')
"

echo ""
echo "=" * 60
echo "✅ All tests complete!"
echo "📱 Check your Slack channel for 4 test messages"
echo "=" * 60

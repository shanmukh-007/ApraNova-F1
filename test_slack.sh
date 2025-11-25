#!/bin/bash

echo "🔔 Testing Slack Integration..."
echo ""

# Test basic message
echo "Sending test message..."
sudo docker exec apranova_backend python manage.py shell -c "
from utils.slack import send_slack_message
result = send_slack_message('🎉 Slack integration test successful! ApraNova is connected.')
if result:
    print('✅ Message sent successfully!')
else:
    print('❌ Failed to send message. Check your webhook URL.')
"

echo ""
echo "Check your Slack channel for the test message!"

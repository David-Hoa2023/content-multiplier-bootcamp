# Twitter Bot - Automated AI Content Generation

This feature adapts concepts from the Tweely Twitter bot to provide automated, AI-generated Twitter content with scheduling capabilities.

## 🚀 Features

### Automated Content Generation
- **AI-Powered Tweets**: Uses your configured LLM provider to generate engaging Twitter content
- **Content Templates**: Customizable prompt templates for different content styles and topics
- **Topic-Based Generation**: Configure content topics to focus your bot's posting strategy
- **Thread Support**: Generate Twitter threads for longer-form content

### Smart Scheduling
- **Multiple Daily Posts**: Configure how many tweets to post per day (max 24)
- **Flexible Scheduling**: Set specific times for posting (e.g., 09:00, 15:00, 21:00)
- **Daily Limits**: Automatic enforcement of daily posting limits
- **Timezone Support**: All scheduling respects your system timezone

### Service Management
- **Start/Stop Control**: Easy service management via API, CLI, or web interface
- **Status Monitoring**: Real-time status, statistics, and next scheduled post
- **Activity Logs**: Complete history of bot activity and performance
- **Error Handling**: Automatic retry logic and error reporting

## 🛠️ Setup

### 1. Prerequisites
Ensure you have the following configured:

- **Twitter API Credentials**: Set up in Publishing Settings
- **LLM Provider**: Configure OpenAI, Anthropic, or other supported provider
- **Database**: Run the Twitter bot migration

### 2. Database Migration
```bash
# Run the Twitter bot migration
psql "$DATABASE_URL" -f infra/migrations/004_twitter_bot.sql
```

### 3. Configuration

#### Via Web Interface
1. Navigate to Settings → Twitter Bot
2. Configure your posting schedule and topics
3. Enable automatic posting
4. Start the bot service

#### Via API
```bash
# Update configuration
curl -X PUT http://localhost:3001/api/twitter-bot/config \
  -H "Content-Type: application/json" \
  -d '{
    "enabled": true,
    "max_tweets_per_day": 3,
    "content_topics": ["AI", "technology", "programming"],
    "schedule_times": ["09:00", "15:00", "21:00"]
  }'
```

## 📱 CLI Management

Use the provided CLI tool for service management:

```bash
# Start the Twitter bot
./scripts/twitter-bot start

# Check status
./scripts/twitter-bot status

# Stop the bot
./scripts/twitter-bot stop

# View recent activity
./scripts/twitter-bot logs

# Show/update configuration
./scripts/twitter-bot config
```

### CLI Commands

| Command | Description |
|---------|-------------|
| `start` | Start the Twitter bot service |
| `stop` | Stop the Twitter bot service |
| `status` | Show detailed bot status and statistics |
| `enable` | Enable automatic posting |
| `disable` | Disable automatic posting |
| `config` | Show current configuration |
| `logs` | Show recent posting activity |
| `help` | Show help information |

## 🎯 Content Templates

The system includes several built-in templates:

### Tech Tips
- **Focus**: Helpful technology tips and best practices
- **Tone**: Educational
- **Topics**: AI, programming, technology, software
- **Hashtags**: #TechTip, #Programming, #AI, #Tech

### AI Insights
- **Focus**: Artificial intelligence insights and trends
- **Tone**: Professional
- **Topics**: AI, machine learning, deep learning, neural networks
- **Hashtags**: #AI, #MachineLearning, #TechInsights, #Innovation

### Startup Wisdom
- **Focus**: Practical startup advice and entrepreneurship
- **Tone**: Professional
- **Topics**: Startups, entrepreneurship, business, funding
- **Hashtags**: #Startup, #Entrepreneur, #Business, #StartupTips

### Coding Tips
- **Focus**: Programming tips and best practices
- **Tone**: Casual
- **Topics**: JavaScript, Python, React, Node.js, web development
- **Hashtags**: #CodingTips, #WebDev, #Programming, #DevTips

## 🔧 API Endpoints

### Service Control
- `POST /api/twitter-bot/start` - Start the bot service
- `POST /api/twitter-bot/stop` - Stop the bot service
- `GET /api/twitter-bot/status` - Get bot status and statistics

### Configuration
- `GET /api/twitter-bot/config` - Get current configuration
- `PUT /api/twitter-bot/config` - Update configuration

### Templates
- `GET /api/twitter-bot/templates` - List content templates
- `POST /api/twitter-bot/templates` - Create new template
- `PUT /api/twitter-bot/templates/:id` - Update template
- `DELETE /api/twitter-bot/templates/:id` - Delete template

### Monitoring
- `GET /api/twitter-bot/history` - Get posting history
- `POST /api/twitter-bot/test-generate` - Generate test content

## 📊 Configuration Options

```json
{
  "enabled": false,                     // Enable/disable automatic posting
  "interval_hours": 12,                 // Fallback interval if schedule_times is empty
  "content_topics": [                   // Topics for content generation
    "AI", 
    "technology", 
    "programming", 
    "startups"
  ],
  "max_tweets_per_day": 3,             // Maximum tweets per day
  "schedule_times": [                   // Specific posting times (24h format)
    "09:00", 
    "15:00", 
    "21:00"
  ]
}
```

## 🔐 Security & Best Practices

### API Keys & Credentials
- Twitter credentials are encrypted using AES-256-GCM
- LLM API keys are stored securely in your settings
- All credentials are scoped to your user account

### Content Safety
- Generated content follows your configured tone and topics
- Content validation ensures Twitter character limits
- Manual review capabilities before automation
- Error handling prevents spam-like behavior

### Rate Limiting
- Respects Twitter API rate limits
- Daily posting limits prevent over-posting
- Exponential backoff on failures
- Comprehensive retry logic

## 📈 Monitoring & Analytics

### Status Dashboard
- Real-time bot status (running/stopped)
- Next scheduled post time
- Success/failure statistics
- Recent activity timeline

### Performance Metrics
- Total posts generated
- Success rate percentage
- Error rates and types
- Engagement metrics (if available)

### Activity Logs
- Complete posting history
- Content preview for each post
- Links to published tweets
- Error messages and debugging info

## 🚨 Troubleshooting

### Common Issues

**Bot won't start:**
- Check Twitter API credentials in Publishing Settings
- Verify LLM provider is configured
- Ensure bot is enabled in configuration

**No tweets being posted:**
- Check daily posting limit hasn't been reached
- Verify schedule times are in correct format (HH:MM)
- Review bot status for any error messages

**Content generation fails:**
- Verify LLM provider API key is valid
- Check content topics are properly configured
- Review template prompts for clarity

### Getting Help

1. **Check Status**: Use `./scripts/twitter-bot status` for detailed information
2. **Review Logs**: Use `./scripts/twitter-bot logs` to see recent activity
3. **Validate Config**: Ensure all prerequisites are met
4. **Test Generation**: Use the test generation API to debug content creation

## 🔄 Migration from Tweely

This implementation provides similar functionality to the original Tweely bot with these improvements:

- **Integration**: Seamlessly integrated with existing content management system
- **Multi-Provider LLM**: Support for multiple AI providers, not just OpenAI
- **Advanced Scheduling**: More flexible scheduling options
- **Web Interface**: Complete web-based management interface
- **Better Monitoring**: Enhanced logging and status reporting
- **Enterprise Features**: Webhook support, encryption, proper error handling

The CLI interface maintains familiar commands similar to systemctl, making it easy for existing Tweely users to transition.
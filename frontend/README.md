# Frontend Options for AI Requirements Analyzer

This directory contains multiple frontend implementations for the AI Requirements Quality Analyzer. Each option provides a different approach to building user interfaces that connect to the FastAPI backend.

## 🎯 Available Options

### 1. **Streamlit** (`streamlit_app.py`)
**Best for:** Rapid prototyping, data science workflows, interactive dashboards

**Pros:**
- ⚡ Quick to deploy and iterate
- 📊 Rich interactive charts and visualizations
- 🐍 Pure Python - no HTML/CSS/JS needed
- 📱 Responsive design out of the box

**Cons:**
- 📦 Larger deployment footprint
- 🎨 Limited customization compared to web frameworks
- 🔄 Less control over UI/UX

**Run:**
```bash
# Method 1: Direct run (make sure API is running first)
pip install streamlit plotly
streamlit run frontend/streamlit_app.py

# Method 2: Use the launcher script (recommended)
python run_streamlit.py
```

**Prerequisites:**
1. **Start the FastAPI backend first:**
   ```bash
   python app.py
   ```

2. **Test the API (optional):**
   ```bash
   python test_api.py
   ```

### 2. **Gradio** (`gradio_app.py`)
**Best for:** ML demos, quick interfaces, research applications

**Pros:**
- 🚀 Extremely fast to build interfaces
- 🤖 ML-focused with built-in components
- 🌐 Automatic public sharing
- 📈 Great for model demos and experiments

**Cons:**
- 🎨 Basic styling options
- 🏗️ Limited for complex applications
- 📊 Fewer charting options than Streamlit

**Run:**
```bash
pip install gradio seaborn
python frontend/gradio_app.py
```

### 3. **HTML/CSS/JavaScript** (`html_js/`)
**Best for:** Custom web applications, full control over UI/UX

**Pros:**
- 🎨 Complete control over design and interaction
- 🚀 Fast loading and responsive
- 🔧 Highly customizable
- 📱 Mobile-first design possible

**Cons:**
- ⏰ More development time
- 🛠️ Requires HTML/CSS/JS knowledge
- 🔄 Manual API integration

**Run:**
```bash
# Serve the HTML files (you'll need a web server)
# For development, you can use Python's built-in server:
cd frontend/html_js
python -m http.server 8080
# Then open http://localhost:8080
```

### 4. **Flask** (`flask_app.py` + `templates/`)
**Best for:** Traditional web applications, database integration, complex workflows

**Pros:**
- 🏗️ Full web framework capabilities
- 🗄️ Easy database integration
- 🔧 Highly extensible
- 🎯 Traditional web development approach

**Cons:**
- 📝 More boilerplate code
- ⏰ Longer development time
- 🎨 Requires template knowledge

**Run:**
```bash
pip install flask matplotlib pandas
python frontend/flask_app.py
```

## 🚀 Quick Start Guide

### Prerequisites

All frontend options require the FastAPI backend to be running:

```bash
# Terminal 1: Start the backend
cd req_quality_ai
pip install -r requirements.txt
python -m spacy download en_core_web_sm
python app.py

# Terminal 2: Choose your frontend
```

### Option 1: Streamlit (Recommended for beginners)

```bash
pip install streamlit plotly
streamlit run frontend/streamlit_app.py
```

### Option 2: Gradio (Quickest to deploy)

```bash
pip install gradio seaborn
python frontend/gradio_app.py
```

### Option 3: Custom HTML/JS (Most control)

```bash
cd frontend/html_js
python -m http.server 8080
# Open http://localhost:8080
```

### Option 4: Flask (Most extensible)

```bash
pip install flask matplotlib pandas
python frontend/flask_app.py
```

## 🔧 Configuration

### API Connection

All frontends connect to the FastAPI backend. Configure the API URL in each frontend file:

```python
# Default configuration
API_BASE_URL = "http://localhost:8000"

# For production deployment
API_BASE_URL = "https://your-api-domain.com"
```

### Customization

#### Streamlit
- Modify `streamlit_app.py` for UI changes
- Add new pages using `st.sidebar.radio()`
- Customize themes in `.streamlit/config.toml`

#### Gradio
- Update the `create_interface()` function
- Add new tabs using `gr.TabItem()`
- Customize themes with `gr.themes.*`

#### HTML/JS
- Edit `index.html` for structure
- Modify `styles.css` for appearance
- Update `script.js` for functionality

#### Flask
- Add new routes in `flask_app.py`
- Create templates in `templates/` directory
- Extend with Flask extensions (SQLAlchemy, etc.)

## 📊 Feature Comparison

| Feature | Streamlit | Gradio | HTML/JS | Flask |
|---------|-----------|--------|---------|-------|
| **Ease of Use** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **Customization** | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Charts/Visualization** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Deployment** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **File Upload** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Real-time Updates** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Mobile Responsive** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

## 🎨 UI/UX Features

### Common Features (All Options)
- ✅ Single requirement analysis
- ✅ Batch analysis with file upload
- ✅ Interactive score visualization
- ✅ Detailed issue reporting
- ✅ Clarification suggestions
- ✅ Sample requirements
- ✅ API health monitoring

### Unique Features

#### Streamlit
- 📊 Advanced Plotly charts
- 📈 Dashboard with analytics
- 🎛️ Sidebar navigation
- 📥 CSV export functionality
- 🔄 Real-time updates

#### Gradio
- 🎯 ML-focused components
- 🌐 Automatic public sharing
- 🤖 Model comparison tools
- 📊 Integrated charting

#### HTML/JS
- 🎨 Custom animations and transitions
- 📱 Mobile-optimized design
- ⚡ Fast loading
- 🔧 Full browser API access

#### Flask
- 👥 User authentication (extensible)
- 🗄️ Database integration
- 📧 Email notifications
- 🔐 Session management

## 🚀 Production Deployment

### Streamlit
```bash
# Deploy to Streamlit Cloud
# Just connect your GitHub repo

# Or deploy manually
streamlit run frontend/streamlit_app.py --server.port 8501 --server.address 0.0.0.0
```

### Gradio
```bash
# Deploy with automatic public URL
python frontend/gradio_app.py

# Or deploy to Hugging Face Spaces
# Just upload the files
```

### HTML/JS
```javascript
// Deploy to any static hosting (Netlify, Vercel, etc.)
// Backend API calls need CORS configuration
```

### Flask
```bash
# Deploy with Gunicorn
pip install gunicorn
gunicorn -w 4 frontend.flask_app:app

# Or deploy to Heroku, DigitalOcean, etc.
```

## 🔧 Development Tips

### Debugging
- Check browser console for JavaScript errors
- Use `print()` statements in Python backends
- Test API endpoints directly with curl/Postman

### Performance
- Implement caching for frequent API calls
- Use lazy loading for large datasets
- Optimize images and assets

### Security
- Validate all user inputs
- Implement rate limiting
- Use HTTPS in production
- Sanitize HTML content

## 🤝 Contributing

When adding new frontend features:

1. **Test across all options** - Ensure consistent behavior
2. **Follow the existing patterns** - Maintain code consistency
3. **Update documentation** - Keep READMEs current
4. **Test with the API** - Verify backend integration

## 📚 Resources

- **Streamlit Docs**: https://docs.streamlit.io
- **Gradio Docs**: https://gradio.app/docs
- **Flask Docs**: https://flask.palletsprojects.com
- **Bootstrap**: https://getbootstrap.com (for HTML/JS)
- **Chart.js**: https://www.chartjs.org (for HTML/JS)

## 🎯 Recommendation

**For most users, start with Streamlit** - it's the fastest way to get a professional-looking interface with rich visualizations. If you need more customization, move to the HTML/JS option. For complex web applications with databases, use Flask.

## 🔧 Troubleshooting

### Common Issues with Streamlit

**"Please enter some text to analyze" error:**
- **Cause**: API connection issue or text input not captured properly
- **Solution**:
  1. Ensure FastAPI backend is running: `python app.py`
  2. Check API health: Visit `http://localhost:8000/health`
  3. Use the debug checkbox in the Streamlit app to see what's happening
  4. Try the test script: `python test_api.py`

**"API Error" messages:**
- **Connection Error**: Backend server not running
- **Timeout Error**: Server overloaded or network issue
- **HTTP Error**: Check the specific error code and message

**Streamlit not updating:**
- Clear browser cache
- Try a different browser
- Restart Streamlit: `streamlit run frontend/streamlit_app.py --server.headless true`

### API Backend Issues

**"Cannot connect to API server":**
```bash
# Check if server is running
curl http://localhost:8000/health

# Start server if needed
python app.py
```

**"spaCy model not found":**
```bash
python -m spacy download en_core_web_sm
```

### Development Tips

- **Debug mode**: Use the debug checkbox in Streamlit for troubleshooting
- **API testing**: Use `test_api.py` to verify backend functionality
- **Logs**: Check terminal output for detailed error messages

---

**Choose the frontend that best fits your needs and development workflow!** 🚀
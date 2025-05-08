// ErrorBoundary.js
import React from 'react';
import Button from './components/componentLists/Button';
// import { useNavigate } from 'react-router-dom';


class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  
  static getDerivedStateFromError(error) {
    // this.navigate = useNavigate()
    // Update state so the next render shows fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log error info to an error reporting service
    this.setState({ errorInfo });
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <>
          <div style={{ padding: 20, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', height: "100vh", border: '1px solid red', borderRadius: 5 }}>
            <div>
              <h2>Something went wrong.</h2>
              <p>{this.state.error?.toString()}</p>
              <details style={{ whiteSpace: 'pre-wrap' }}>
                {this.state.errorInfo?.componentStack}
              </details>
            </div>
            <div className='my-6'>
              <Button children={'Reload'} className={'button background-gradient text-white'} type={'button'}/>
            </div>
          </div>

        </>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

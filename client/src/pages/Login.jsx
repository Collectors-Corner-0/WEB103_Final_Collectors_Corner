const Login = ({ authUrl }) => {
  return (
    <div className="collector-container">
      <h2>Log in</h2>
      <p>Sign in with your GitHub account to add media, keep a library, and tag your collection.</p>
      <a href={`${authUrl}/github`} className="btn btn-primary">
        Log in with GitHub
      </a>
    </div>
  )
}

export default Login

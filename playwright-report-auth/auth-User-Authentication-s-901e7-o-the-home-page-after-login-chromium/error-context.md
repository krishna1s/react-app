# Page snapshot

```yaml
- main:
  - alert: Username or password is invalid
  - img
  - heading "Sign in" [level=1]
  - text: Username
  - textbox "Username"
  - text: Password
  - textbox "Password"
  - checkbox "Remember me"
  - text: Remember me
  - button "Sign In"
  - link "Don't have an account? Sign Up":
    - /url: /signup
  - paragraph:
    - text: Built by
    - link:
      - /url: https://cypress.io
      - img
```
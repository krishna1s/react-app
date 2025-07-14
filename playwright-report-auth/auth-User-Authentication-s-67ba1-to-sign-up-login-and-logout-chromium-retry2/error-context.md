# Page snapshot

```yaml
- main:
  - img
  - heading "Sign Up" [level=1]
  - text: First Name
  - textbox "First Name"
  - text: Last Name
  - textbox "Last Name"
  - text: Username
  - textbox "Username"
  - text: Password
  - textbox "Password"
  - text: Confirm Password
  - textbox "Confirm Password"
  - button "Sign Up"
  - link "Have an account? Sign In":
    - /url: /signin
  - paragraph:
    - text: Built by
    - link:
      - /url: https://cypress.io
      - img
```
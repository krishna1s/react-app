# Page snapshot

```yaml
- banner:
  - button "open drawer"
  - heading [level=1]:
    - link:
      - /url: /
      - img
  - link "New":
    - /url: /transaction/new
  - link "8":
    - /url: /notifications
- img "Ted Parisian"
- heading "Ted P" [level=6]
- heading "@Heath93" [level=6]
- heading "$1,509.53" [level=6]
- heading "Account Balance" [level=6]
- separator
- list:
  - link "Home":
    - /url: /
  - link "My Account":
    - /url: /user/settings
  - link "Bank Accounts":
    - /url: /bankaccounts
  - link "Notifications":
    - /url: /notifications
- separator
- list:
  - button "Logout"
- main:
  - heading "Create Bank Account" [level=2]
  - textbox "Bank Name": Test Bank
  - textbox "Routing Number": "123456789"
  - textbox "Account Number": "123"
  - paragraph: Must contain at least 9 digits
  - button "Save" [disabled]
  - paragraph:
    - text: Built by
    - link:
      - /url: https://cypress.io
      - img
```
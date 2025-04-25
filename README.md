# This application is a CRUD vacation planner application
screenshot of login screen.
!["screenshot of login page."](./images-for-readme/login.png)

screenshot of sign up screen.
!["screenshot of signup page."](./images-for-readme/signup.png)

screenshots of error user will see if they try to login with invalid credentials.
!["screenshot of error message indicating invalid username or password"](./images-for-readme/username_or_password_is_incorrect.png)

screenshot of error user will see if they try to sign up with a username that already exists.
!["screenshot of error message indicating that the entered username already exists"](./images-for-readme/username_already_exists.png)

Screenshot of vacation planner with 1 planned vacation.
![screenshot of vacation planner with 1 planned vacation](./images-for-readme/all_vacations.png)

Screenshot of viewing vacation.
!["screenshot of viewing vacation."](./images-for-readme/view_vacation.png)

Screenshot of editing vacation. It is the same as when creating new vacation.
!["screenshot of editing vacation. It is the same as when creating new vacation."](./images-for-readme/edit_vacation.png)

screenshot of alert popup when attempting to delete vacation.
!["screenshot of alert popup when attempting to delete vacation."](./images-for-readme/alert-confirmation-when-attemping-to-delete-vacation.png)

## To run the application:
First open a terminal window and navigate to the root directory.

Then, run `python3 -m venv venv` to create the virtual environment to prevent version conflicts.

Then, run `source ./venv/bin/activate` to activate the virtual environment.

Once inside the virtually environment, run `pip install -r backend/requirements.txt` to install the necessary dependencies to run the application.

Then navigate to the backend directory by running `cd backend`

Finally, run `uvicorn main:app --reload` to run the application. Press command+click on the port number to view the app in the brower.
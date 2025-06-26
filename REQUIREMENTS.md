User Management
Objective:
Develop a Node.js application that exposes four RESTful API endpoints for user management, including creating, retrieving, deleting, and updating users. The application should include validation, error handling, and logging. It must be structured to ensure code reusability and efficiency, with proper database integration and meaningful API responses.

Assignment Task:

1. API Endpoint Implementation:
   1.1 Create User Endpoint:
   Endpoint: /create_user

Method: POST

Payload:

{
"full_name": "John Doe",
"mob_num": "+911234567890",
"pan_num": "ABCDE1234F",
"manager_id": "uuid-v4"
}

Validations:

full_name: Must not be empty.
mob_num: Must be a valid 10-digit mobile number. If a prefix like 0 or +91 is provided, adjust the number before storing it.
pan_num: Must be a valid PAN number (e.g., ABCDE1234F). Convert to uppercase if necessary.
manager_id: Validate against the manager table to ensure the manager is active.
Database:

Store validated user data with a generated user_id (UUID v4).
Include created_at, updated_at timestamps, and a is_active flag set to true.
Response: Return a success message or an appropriate error message if validations fail.

1.2 Get Users Endpoint:
Endpoint: /get_users

Method: POST

Payload (Optional):

{
"user_id": "uuid-v4",
"mob_num": "1234567890",
"manager_id": "uuid-v4"
}

Functionality:

Retrieve all user records if no filters are provided.
Return a specific user when user_id or mob_num is provided.
Return all users managed by a specific manager when manager_id is provided.
Response: Return a JSON object with a users key containing an array of user objects. If no users are found, return an empty array.

1.3 Delete User Endpoint:
Endpoint: /delete_user

Method: POST

Payload:

{
"user_id": "uuid-v4",
"mob_num": "1234567890"
}

Functionality:

Delete the user record if user_id or mob_num is found in the database.
Response: Return a success message upon successful deletion or an error message if the user is not found.

1.4 Update User Endpoint:
Endpoint: /update_user

Method: POST

Payload:

{
"user_ids": ["uuid-v4", "uuid-v4"],
"update_data": {
"full_name": "Jane Doe",
"mob_num": "0987654321",
"pan_num": "FGHIJ6789K",
"manager_id": "uuid-v4"
}
}

Validations:

Same as in the /create_user endpoint.
Functionality:

If only manager_id is being updated for multiple users, proceed with the bulk update.
For individual updates of other fields, validate and update as required.
If the manager_id is updated and the user already has a manager, mark the current entry as is_active=false, and create a new entry with the updated manager_id.
Response: Return a success message upon successful update or an appropriate error message for any validation failures or missing keys.

2. Database Integration:
   Database: Use SQLite for data storage.
   Tables:
   users: Stores user details with fields for user_id, full_name, mob_num, pan_num, manager_id, created_at, updated_at, and is_active.
   managers: Stores manager details with fields for manager_id and is_active. Prefill with sample data for testing.
   Schema: Document the schema used to create the managers table in the README.

3. Additional Requirements:
   3.1 Error Handling & Logging:
   Implement robust error handling for all endpoints, ensuring appropriate return statements for each type of error.
   Include meaningful logs for each API call, especially for errors.
   3.2 Code Reusability:
   Ensure code is modular and reusable, minimizing duplication across endpoints.
   Implement validation logic in separate utility functions or middleware.
   3.3 Missing Keys Check:
   Ensure that all APIs include checks for missing required keys and return appropriate error messages.
   3.4 Screen Recording:
   After completing the task, screen record sample API calls to the four endpoints, demonstrating the application’s functionality.

Evaluation Criteria:
Code Quality:
Assess the clarity, readability, and organization of the code.
Evaluate the use of comments and proper naming conventions.
Functionality:
Ensure that all API endpoints function as expected, with proper validation and error handling.
Database Design:
Review the efficiency and correctness of the database schema.
Ensure that the schema supports all required operations and relationships.
Error Handling & Logging:
Confirm that errors are handled gracefully and that logs provide meaningful insights.
Screen Recording:
Evaluate the clarity and completeness of the screen recording, ensuring it demonstrates the working APIs.
Documentation:
Assess the clarity and completeness of the README.md file, ensuring all instructions and explanations are easy to follow.

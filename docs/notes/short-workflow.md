# Short Service Workflow (Success Path)

This guide shows the step-by-step process of a **successfully completed** service request in the system.

## Step 1: Service Request Creation
- **Action**: A customer submits a service request via the public form or an Admin creates it from the dashboard ([/services](/services)).
- **Result**: A new service is created with the status `pending`.
- **Notification**: Customer receives an SMS with a tracking link.

## Step 2: Expert Appointment
- **Action**: Admin reviews the `pending` service and appoints a Technician or Electrician.
- **Result**: Service status changes to `in_progress`.
- **Notification**: 
  - Expert receives an SMS with customer details and a service report link.
  - Customer receives an SMS notifying them that an expert has been appointed.

## Step 3: Service Execution & Reporting
- **Action**: Expert visits the customer, performs the repair/installation, and fills out the Service Report via their portal.
- **Result**: Expert marks the service as `resolved`.

## Step 4: Completion & Finalization
- **Action**: Admin or Expert marks the service as `completed` in the system.
- **Result**: 
  - Service status changes to `completed`.
  - Expert's statistics (Successful Services) are automatically updated.
- **Notification**: Customer receives a final SMS with a thank-you message and a link to provide feedback.

---
**Note**: This workflow assumes a "Happy Path" where no cancellations or delays occur.

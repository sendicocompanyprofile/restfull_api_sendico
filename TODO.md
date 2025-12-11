# TODO: Enhance Error and Success Messages for Picture Editing in updatePosting

## Tasks
- [ ] Update `src/controllers/posting.controller.ts`:
  - Enhance error message for picture upload failures to be more specific (e.g., "Failed to upload new pictures: [details]").
  - Add custom success message indicating if pictures were updated (e.g., "Posting updated successfully. Pictures have been updated." or "Posting updated successfully.").

- [ ] Update `src/services/posting.service.ts`:
  - Modify the updatePosting method to throw a ResponseError if deleting old pictures fails, with a specific message like "Failed to delete old pictures during update".

- [ ] Test the changes:
  - Verify that error messages appear correctly for upload and deletion failures.
  - Verify that success messages are appropriate and indicate picture updates when applicable.

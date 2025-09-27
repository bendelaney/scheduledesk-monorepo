// GraphQL query:
/*
query JobNotes {
  job(id:"Z2lkOi8vSm9iYmVyL0pvYi84NTU4NTExOA==") {
    notes(
      first:20
      sort: {
      	key:CREATED_AT
      	direction: DESCENDING
    	}
    ) {
      nodes { 
				... on JobNote {
          id
          message
          fileAttachments {
            nodes {
              fileName
              url
              thumbnailUrl
            }
          }
          createdBy {
            ... on User {
              id
              name {
                full
              }
            }
          }
          createdAt
          lastEditedBy {
            ... on User {
              id
              name {
                full
              }
            }
          }
        }
      }
    }
    total

  }
}
*/

// Raw data returned by query above: 
const jobNotesDATA = {
  "data": {
    "job": {
      "notes": {
        "nodes": [
          {
            "id": "Z2lkOi8vSm9iYmVyL0pvYk5vdGUvMTM0NDc1ODA2",
            "message": "👍🏼CONFIRMED for 5/16",
            "fileAttachments": {
              "nodes": []
            },
            "createdBy": {
              "id": "Z2lkOi8vSm9iYmVyL1VzZXIvMzY4Mzkz",
              "name": {
                "full": "Ben Delaney"
              }
            },
            "createdAt": "2024-05-15T23:31:36Z",
            "lastEditedBy": null
          },
          {
            "id": "Z2lkOi8vSm9iYmVyL0pvYk5vdGUvMTMzODQ5NzI5",
            "message": "💬sent confirmation text via Jobber re: 5/14.",
            "fileAttachments": {
              "nodes": []
            },
            "createdBy": {
              "id": "Z2lkOi8vSm9iYmVyL1VzZXIvMzY4Mzkz",
              "name": {
                "full": "Ben Delaney"
              }
            },
            "createdAt": "2024-05-10T16:37:43Z",
            "lastEditedBy": {
              "id": "Z2lkOi8vSm9iYmVyL1VzZXIvMzY4Mzkz",
              "name": {
                "full": "Ben Delaney"
              }
            }
          },
          {
            "id": "Z2lkOi8vSm9iYmVyL0pvYk5vdGUvMTI2ODE5Mjk3",
            "message": "",
            "fileAttachments": {
              "nodes": [
                {
                  "fileName": "F5F22F48-C478-48BA-9358-2F7BD98B79E5.jpg",
                  "url": "https://jobber.s3.amazonaws.com/note_file_attachments/02f6-183039747/original/F5F22F48-C478-48BA-9358-2F7BD98B79E5.jpg?X-Amz-Expires=259200&X-Amz-Date=20240517T101821Z&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAUAKBZSZ5OWXNB7KX%2F20240517%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-SignedHeaders=host&X-Amz-Signature=5a6664177fa33970c90494848f802d6b5aba66d2cfc174945f180339da8cfe86",
                  "thumbnailUrl": "https://d3c880upivypdk.cloudfront.net/eyJidWNrZXQiOiJqb2JiZXIiLCJrZXkiOiJub3RlX2ZpbGVfYXR0YWNobWVudHMvMDJmNi0xODMwMzk3NDcvb3JpZ2luYWwvRjVGMjJGNDgtQzQ3OC00OEJBLTkzNTgtMkY3QkQ5OEI3OUU1LmpwZyIsImVkaXRzIjp7InJlc2l6ZSI6eyJ3aWR0aCI6MTUwLCJoZWlnaHQiOjE1MCwiZml0IjoiY292ZXIifSwicm90YXRlIjpudWxsfX0="
                },
                {
                  "fileName": "E13F6E1C-021E-4BCD-9427-843ECDECBF8D.jpg",
                  "url": "https://jobber.s3.amazonaws.com/note_file_attachments/26c6-183039748/original/E13F6E1C-021E-4BCD-9427-843ECDECBF8D.jpg?X-Amz-Expires=259200&X-Amz-Date=20240517T101821Z&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAUAKBZSZ5OWXNB7KX%2F20240517%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-SignedHeaders=host&X-Amz-Signature=70da628fa87c312183fd39fca58789a934f7c137a3106fa3494070174a0fd880",
                  "thumbnailUrl": "https://d3c880upivypdk.cloudfront.net/eyJidWNrZXQiOiJqb2JiZXIiLCJrZXkiOiJub3RlX2ZpbGVfYXR0YWNobWVudHMvMjZjNi0xODMwMzk3NDgvb3JpZ2luYWwvRTEzRjZFMUMtMDIxRS00QkNELTk0MjctODQzRUNERUNCRjhELmpwZyIsImVkaXRzIjp7InJlc2l6ZSI6eyJ3aWR0aCI6MTUwLCJoZWlnaHQiOjE1MCwiZml0IjoiY292ZXIifSwicm90YXRlIjpudWxsfX0="
                },
                {
                  "fileName": "9D36CA70-36A6-4445-A8E6-7ACDB3F389EA.jpg",
                  "url": "https://jobber.s3.amazonaws.com/note_file_attachments/2bf0-183039749/original/9D36CA70-36A6-4445-A8E6-7ACDB3F389EA.jpg?X-Amz-Expires=259200&X-Amz-Date=20240517T101821Z&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAUAKBZSZ5OWXNB7KX%2F20240517%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-SignedHeaders=host&X-Amz-Signature=97252bd6ca5152b243c088a3730273eea1fcbaed770b53af7fe3f10cb92bfaab",
                  "thumbnailUrl": "https://d3c880upivypdk.cloudfront.net/eyJidWNrZXQiOiJqb2JiZXIiLCJrZXkiOiJub3RlX2ZpbGVfYXR0YWNobWVudHMvMmJmMC0xODMwMzk3NDkvb3JpZ2luYWwvOUQzNkNBNzAtMzZBNi00NDQ1LUE4RTYtN0FDREIzRjM4OUVBLmpwZyIsImVkaXRzIjp7InJlc2l6ZSI6eyJ3aWR0aCI6MTUwLCJoZWlnaHQiOjE1MCwiZml0IjoiY292ZXIifSwicm90YXRlIjpudWxsfX0="
                }
              ]
            },
            "createdBy": {
              "id": "Z2lkOi8vSm9iYmVyL1VzZXIvMzY5NTE2",
              "name": {
                "full": "Isaiah Crandall"
              }
            },
            "createdAt": "2024-03-12T00:22:15Z",
            "lastEditedBy": null
          },
          {},
          {}
        ]
      },
      "total": 768
    }
  },
  "extensions": {
    "cost": {
      "requestedQueryCost": 6264,
      "actualQueryCost": 46,
      "throttleStatus": {
        "maximumAvailable": 10000,
        "currentlyAvailable": 9954,
        "restoreRate": 500
      }
    },
    "versioning": {
      "version": "2024-04-17"
    }
  }
};

export default jobNotesDATA;
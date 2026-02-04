# Pull Request: Multi-Form Support for all mutations & queries

## What does this PR do?
* Refactors application workflow mutations to support multiple form types (540, 541, 542)
* Updates application read tracking to be staff-specific rather than global
* Enhances all application processing mutations to handle `form_type` parameter
* Maintains backward compatibility for existing functionality

## Description of Tasks Completed
### 1. Application Read Tracking Enhancement
* **Changed**: `isRead` status now tracks per-staff rather than globally
* **Reason**: Each staff member should independently mark applications as read
* **Implementation**: Added staff-specific read tracking in all application types

### 2. Multi-Form Support for Workflow Mutations
Updated all application workflow mutations to accept `formType` parameter:
* `readApplication` - Mark application as read by current staff
* `deleteDraftApplication` - Delete draft applications
* `changeProcessingStatus` - Update application status (APPROVED, REJECTED, PENDING, REVIEWED, VERIFIED, VERIFIED_FINAL)
* `requestChanges` - Request changes to specific application sections
* `resolveRequestedChanges` - Resolve previously requested changes
* `setApplicationDeadline` - Set deadline for application processing
* `removeDeadline` - Remove existing deadline
* `toggleCanScheduleExam` - Enable/disable exam scheduling for specific applications

## Breaking Changes
⚠️ **Important**: The following changes affect existing functionality:

1. **Read Status Behavior**: `isRead` is now staff-specific. An application marked as read by one staff member will not show as read for other staff members.

## How should this be manually tested?

```
#read application:
mutation {
  readApplication(applicationId: "698341ba3855a7624113fb08", formType: "application-540") {
    message
  }
}

# create draft application:
mutation {
  createApplication(formType: "application-540", form540Data: {
    status: "DRAFT"
    applicantsCertification: {date: "2022-10-10", signature: "Chris"}
    applicationMadeFor: "Validation"
    files: {airmanLogbookReviewed: ["697b8526f1978eed723fbfe4"], copiesOfAllIssuedRwandaLicenses: ["681b880a164386f61326b765", "681b880a164386f61326b765"], copiesOfCompanyLetters: ["681b880a164386f61326b765"], copyOfAircraftLeaseReviewed: ["681b880a164386f61326b765"], copyOfApplicableAircraftTrainingOrExperience: ["681b880a164386f61326b765"], copyOfOtherStatesAirmanLicenses: ["681b880a164386f61326b765"], copyOfOtherStatesMedicalEvaluation: ["681b880a164386f61326b765"], identificationDocument: ["681b880a164386f61326b765"], last12MonthsExperienceReviewed: ["681b880a164386f61326b765"], otherRelevantExperienceOrTrainingDocuments: ["681b880a164386f61326b765"], profilePhoto: ["681b880a164386f61326b765"]}
    medicalEvaluationInfo: {classOfCertificate: "Class A", dateOfIssue: "2022-10-10", medicalExaminer: "Hirwa Emmy", stateOfIssue: "Rwanda"}
    otherLicenses: {licenceNumber: "LIC 1", stateOfIssue: "Rwanda", dateIssued: "2022-10-10", ratingRequested: "12"}
    pilotInformation: {dateIssued: "2020-10-10", instrumentPic: "PIC", licenseNumber: "100", licenseStatus: "status", ratingRequested: "RATING 11", stateOfIssue: "Bugesera", totalFlightHrs: "100", totalHrsType: "TYPE", totalNightHrs: "100", totalPicHrs: "", totalXCHrs: "100"}
    typeOfLicence: "vALIDATION"
    airmanPersonalInfo: {name: "Mpano Christian", emailAddress: "mpanoc6@gmail.com", cityStateProvince: "Kigali", dateOfBirth: "2022-10-10", eyes: "blue", gender: "MALE", hair: "grey", height: "100", englishLanguageProficiency: "A1", nationality: "Rwanda", placeOfBirth: "Bugesera", otherAddress: "Bugesera", telephoneNo: "0791587513", weight: "100kg"}
  }) {
    application {
    	application {
        ... on PelForm540ApplicationType {
          id
          files {
            airmanLogbookReviewed {
              id
              filename
              data
            }
          }
        }
      }
    }
  }
}

# delete draft application:
mutation {
  deleteDraftApplication(applicationId: "698348c0e28469d3a0d08b56", formType: "application-540") {
    message
  }
}

# read application:
mutation {
  readApplication(applicationId: "698341ba3855a7624113fb08", formType: "application-540") {
    message
  }
}

# change processing status (APPROVED, REJECTED, PENDING, REVIEWED, VERIFIED, VERIFIED_FINAL)
mutation {
  changeProcessingStatus(applicationId: "698341ba3855a7624113fb08", formType: "application-540", status: "REVIEWED", remarks: "") {
    message
  }
}

# request changes

mutation {
  requestChanges(applicationId: "698341ba3855a7624113fb08",
    formType: "application-540"
  	form540Data: {
      remarks: "remarks",
      sections: [
        "application_made_for",
        "other_licenses",
        "files"
      ]
    }
  ) {
    message
  }
}

# application info with requested changes sections:
query {
   applicationInfo(applicationId: "698341ba3855a7624113fb08") {
     id
     applicationType
     applicationDetails {
       ... on PelForm540ApplicationType {
         id
         status
         processingStatus
         changesRequestedSections
       }
     }
   }
}

# resolve requested changes
mutation {
  resolveRequestedChanges(
    formType: "application-540", 
    applicationId: "698341ba3855a7624113fb08", 
    form540Data: {
      applicationMadeFor: "validation"
      otherLicenses: [{
        id: "477f1acf-cc69-4831-af24-e85a666ce2be",
        dateIssued: "2020-10-10",
        stateOfIssue: "Rwanda",
      },
      ],
      files: {
        airmanLogbookReviewed: ["697b8526f1978eed723fbfe4"]
      }
  	}) {
    message
  }
}

# update allowed exam days:
mutation {
  resolveRequestedChanges(
    formType: "application-540", 
    applicationId: "698341ba3855a7624113fb08", 
    form540Data: {
      applicationMadeFor: "validation"
      otherLicenses: [{
        id: "477f1acf-cc69-4831-af24-e85a666ce2be",
        dateIssued: "2020-10-10",
        stateOfIssue: "Rwanda",
      },
      ],
      files: {
        airmanLogbookReviewed: ["697b8526f1978eed723fbfe4"]
      }
  	}) {
    message
  }
}

# To create exam type, we will need to drop original index name that was created before
# In a Python shell or migration script

from pel_apis.models import ExamType

# Drop the old index

ExamType._get_collection().drop_index('name_1')

then run:
mutation {
  createExamType(examType: "Maths ad") {
    message 
  }
}

# so examtype not changed

# toggle can schedule exam:

mutation {
  toggleCanScheduleExam (
    canScheduleExam:true,
    formType: "application-541", 
    applicationId: "697c8efbc0d974613a699c80", 
    examTypeId: "695e2d554d5b919124ba59c2") {
    
    application {
      ... on StaffPelForm541ApplicationType {
        id
      }
    }
    message
  }
}
```
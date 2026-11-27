# T2, T12, S1, S5, S9 - Sections

## Description

This QTI 3.0 Conformance Test Sample aims at testing the **T12 - Multiple Sections** ,  **T2 - Test Level Time Limits**, **S1 ItemSessionControl in Sections** , **S5 Rubric Block in Sections** and **S9 Assessment Section Ref** features. It enables vendors to
test the Delivery Engine to serve the appropriate items to the candidate depending on how **AssessmentSections**
are structured amongst the **AssessmentTest**. 


| SECTIONS                  |   |
|-----------------------|---|
| **Test Sample ID**        | T-12-multiple sections & T2 Test Level Time Limits & S1 Item Session Control in Sections & S5 Rubric Block in Sections & S9 Assessmnet Section Referencing|
| **Test Sample Title**     | T-12 - Multiple Sections |
| **Dependencies**          | T4 - Test Part |
| **Related Documentation** | Section 4 of the BPIG - location/link, TBD |

## Acceptance Criteria

### EXPORT

#### T12 multiple sections
* T12-L2-E1: export a valid test where at least one test part has at least 2 sections.
#### T2 Test Level Time Limits
* T2-L2-E1: export a valid test where a test level time limit is set in qti-time-limits; max-time is expressed as a duration in seconds.
#### S1 Item Session Control
* S1-L2-E1: export a valid test with qti-item-session-control within at least one section.
#### S9 Assessment Section Referencing
* OPTIONAL S9-L2-E1: export a valid test with at least one reference to a section file from qti-assessment-section-ref.

### IMPORT

#### T12 multiple sections
* T12-L2-I1: import assessment.xml and store the test with all parts and sections with items properly without loss of data.
#### T2 Test Level Time Limits
* T2-L2-I1: import assessment.xml and store qti-time-limits max-time in association with the overall assessment - 60 seconds in this case.
#### S1 Item Session Control
* S1-L2-I1: import assessment.xml and store qti-item-session-control data for sections 1 & 2.
#### S9 Assessment Section Referencing
* S9-L2-I1: import assessment.xml and store section 3 as part of the test. Note that the importing system DOES NOT need to store the section by reference within their own system, but it may choose to do so.

### AUTHORING

* T12-L2-A1: Create a test where there is more than 1 section in a test part.
* T12-L2-A2: Modify a test where there is more than 1 section in a test part by changing the number of parts in the test.

### DELIVERY

#### T12 multiple sections
* T12-L2-D1: The Test contains 8 Items: Item 1, Item 2, Item 3, Item 4, Item 5, Item 6, Item 7, Item 8. Items MUST be displayed in 3 different Sections. **Section 1** contains items 1-4. **Section 2** contains items 5-7. **Section 3** contains only item 8.

#### T2 Test Level Time Limits
* T2-L2-D1: The test is limited to 60 seconds. The amount of time remaining MUST be available to the candidate during the assessment session.
#### S1 Item Session Control
* S1-L2-D1: In Section 1, allow-skipping="true", candidates MUST be able to "skip"; i.e., proceed without entering a response, all items in Section 1 and proceed to other sections in the assessment.
* S1-L2-D2: In Section 2, allow-skipping="false", candidates MUST provide a response for each item in Section 2 before proceeding to the next items within Section 2 and Section 3.
#### S9 Assessment Section Referencing
* S9-L2-D1: **Section 3** is derived from a **section reference** (AssessmentSectionRef) using file section3.xml and contains only item 8. The system MUST present the referenced section to the candidate as part of the assessment.

# S3 - Selection & S4 - Ordering

## Description

This example is taken from the QTI 2.2 BPIG and modified to exclude the use of **sub-sections (S8)** as that's an Elective feature. The resulting sample covers **S3 (selection)** and **S4 (ordering)**.

| S3 - Selection & S4 - Ordering |   |
|-----------------------|---|
| **Test Sample ID**        | s3selection_s4ordering |
| **Test Sample Title**     | S3 - Selection & S4 - Ordering |
| **Dependencies**          | T4 - Test Parts, T7 - Sections, I9a - Response Processing-Full, I9b - Response Processing Fixed Template |
| **Related Documentation** | Section 4 of the BPIG - location/link, TBD |

## Acceptance Criteria

### EXPORT
* S3-L2-E1: Export a valid test with a section that contains a qti-selections node which includes the select attribute.
* S4-L2-E1: Export a valid test with a section that contains a qti-ordering with any ordering data.

### IMPORT
* S3-L2-I1: import s3selection_s4ordering.xml and correctly store the selections data for the sections.
* S4-L2-I1: import s3selection_s4ordering.xml and correctly store the order data for the sections.
* S4-L2-I2: import s3selection_s4ordering.xml and correctly store the navigation-mode for the test part.

### AUTHORING

* S3-L2-A1: Create a test and set the number of items in a section of that test to be presented to candidates for a number less than the total number of items referenced in the section.
* S3-L2-A2: Modify a section in a test and set the number of items to be included in that section of the test to be presented to candidates for a number less than the total number of items referenced in that section.

* S4-L2-A1: Create a test and set the items within a section to be shuffled for each candidate when initiating a test session.
* S4-L2-A2: Modify a test and set the items within a section to be shuffled for each candidate when initiating a test session.
* S4-L2-A3: Modify a test and set the items within a section to NOT be shuffled for each candidate when initiating a test session.

* S4-L2-A11: Within a Test Part, set to allow for the candidate to choose to navigate to items within that part in a non-linear order.
* S4-L2-A12: Within a Test Part, set to restrict the candidate to be presented items within that part in linear order only.

### DELIVERY

* S3-L2-D1: s3selection_s4ordering.xml, In Section A, we select 2 items out of 3 with Item 1 required. The remaining item needed to fill the selection (value 2 in this case) must be selected randomly from the remaining 2 non-required items.
* S3-L2-D2: s3selection_s4ordering.xml, In Section B, we select 2 items out of 3 with no items required.  The items needed to fill the selection (value 2 in this case) must be selected randomly from the 3 available items. 
* S4-L2-D1: s3selection_s4ordering.xml, Section B, shuffled Order is true, which requires the selected items to be shuffled yet again.
* S4-L2-D11: The test is presented as nonlinear, allowing students to navigate freely.
* S4-L2-D12: The test contains two sections, both of which are defined as visible, so should be visible to the test-taker

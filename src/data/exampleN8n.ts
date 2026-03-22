export const exampleN8nData = {
    "data": {
        "updatedAt": "2026-02-06T02:51:11.909Z",
        "createdAt": "2026-02-06T02:48:27.044Z",
        "id": "c1wUf7_slqre99fhTmXP4",
        "name": "Lao PDR Service Passport Application and Processing",
        "description": null,
        "active": false,
        "isArchived": false,
        "nodes": [
            {
                "parameters": {
                    "formTitle": "Lao PDR Passport Application - Personal Information",
                    "formDescription": "Please provide your personal details for passport application",
                    "formFields": {
                        "values": [
                            {
                                "fieldLabel": "Full Name (as in Birth Certificate)",
                                "fieldName": "full_name",
                                "placeholder": "Enter your full name",
                                "requiredField": true
                            },
                            {
                                "fieldLabel": "Date of Birth",
                                "fieldName": "date_of_birth",
                                "placeholder": "DD/MM/YYYY",
                                "requiredField": true
                            },
                            {
                                "fieldLabel": "Place of Birth",
                                "fieldName": "place_of_birth",
                                "placeholder": "City/Province",
                                "requiredField": true
                            },
                            {
                                "fieldLabel": "National ID Number",
                                "fieldName": "national_id_number",
                                "placeholder": "Enter your Lao ID number",
                                "requiredField": true
                            },
                            {
                                "fieldLabel": "Phone Number",
                                "fieldName": "phone_number",
                                "placeholder": "+856...",
                                "requiredField": true
                            },
                            {
                                "fieldLabel": "Email Address",
                                "fieldType": "email",
                                "fieldName": "email_address",
                                "placeholder": "your.email@example.com",
                                "requiredField": true
                            },
                            {
                                "fieldLabel": "Current Address",
                                "fieldName": "current_address",
                                "placeholder": "Street, Village, District, Province",
                                "requiredField": true
                            }
                        ]
                    },
                    "options": {
                        "appendAttribution": false,
                        "buttonLabel": "Continue to Document Upload"
                    }
                },
                "id": "7eed4d99-1a35-4dee-aac2-0e1cc31114b8",
                "name": "Passport Application Form",
                "type": "n8n-nodes-base.formTrigger",
                "typeVersion": 2.5,
                "position": [
                    256,
                    496
                ],
                "webhookId": "279ef8ee-e4a2-4112-9921-c356973d178c"
            },
            {
                "parameters": {
                    "formFields": {
                        "values": [
                            {
                                "fieldLabel": "National ID Card",
                                "fieldType": "file",
                                "multipleFiles": false,
                                "requiredField": true
                            },
                            {
                                "fieldLabel": "Birth Certificate",
                                "fieldType": "file",
                                "multipleFiles": false,
                                "requiredField": true
                            },
                            {
                                "fieldLabel": "Recent Photo",
                                "fieldType": "file",
                                "multipleFiles": false,
                                "requiredField": true
                            },
                            {
                                "fieldLabel": "Additional Documents",
                                "fieldType": "file"
                            }
                        ]
                    },
                    "options": {
                        "formTitle": "Document Upload",
                        "formDescription": "Please upload required documents for your passport application",
                        "buttonLabel": "Continue to Service Selection"
                    }
                },
                "id": "d5f7dca8-fe2d-4be6-90f1-6cf67928ed56",
                "name": "Document Upload Form",
                "type": "n8n-nodes-base.form",
                "typeVersion": 2.5,
                "position": [
                    480,
                    496
                ],
                "webhookId": "9adcc97f-6fd7-4538-a987-49350b837d95"
            },
            {
                "parameters": {
                    "formFields": {
                        "values": [
                            {
                                "fieldLabel": "Passport Type",
                                "fieldType": "dropdown",
                                "fieldOptions": {
                                    "values": [
                                        {
                                            "option": "Ordinary Passport"
                                        },
                                        {
                                            "option": "Official Passport"
                                        },
                                        {
                                            "option": "Diplomatic Passport"
                                        }
                                    ]
                                },
                                "requiredField": true
                            },
                            {
                                "fieldLabel": "Service Speed",
                                "fieldType": "dropdown",
                                "fieldOptions": {
                                    "values": [
                                        {
                                            "option": "Regular (10-15 business days)"
                                        },
                                        {
                                            "option": "Express (5-7 business days)"
                                        },
                                        {
                                            "option": "Urgent (2-3 business days)"
                                        }
                                    ]
                                },
                                "requiredField": true
                            },
                            {
                                "fieldLabel": "Number of Pages",
                                "fieldType": "dropdown",
                                "fieldOptions": {
                                    "values": [
                                        {
                                            "option": "32 Pages"
                                        },
                                        {
                                            "option": "48 Pages"
                                        }
                                    ]
                                },
                                "requiredField": true
                            },
                            {
                                "fieldLabel": "Special Requests or Notes",
                                "fieldType": "textarea",
                                "placeholder": "Any special requirements or additional information"
                            }
                        ]
                    },
                    "options": {
                        "formTitle": "Passport Type and Service Selection",
                        "formDescription": "Select the type of passport and processing service you need"
                    }
                },
                "id": "ea7c8b8e-639f-4953-b195-918e7b5d3271",
                "name": "Service Type Selection Form",
                "type": "n8n-nodes-base.form",
                "typeVersion": 2.5,
                "position": [
                    704,
                    496
                ],
                "webhookId": "c5126b0d-bd9c-4b2e-a908-62a846a6f341"
            },
            {
                "parameters": {
                    "assignments": {
                        "assignments": [
                            {
                                "id": "id-1",
                                "name": "applicationId",
                                "value": "={{ 'LAO-' + new Date().getTime() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase() }}",
                                "type": "string"
                            },
                            {
                                "id": "id-2",
                                "name": "submissionDate",
                                "value": "={{ new Date().toISOString() }}",
                                "type": "string"
                            },
                            {
                                "id": "id-3",
                                "name": "fullName",
                                "value": "={{ $('Passport Application Form').item.json['Full_Name_(as_in_Birth_Certificate)'] }}",
                                "type": "string"
                            },
                            {
                                "id": "id-4",
                                "name": "dateOfBirth",
                                "value": "={{ $('Passport Application Form').item.json['Date_of_Birth'] }}",
                                "type": "string"
                            },
                            {
                                "id": "id-5",
                                "name": "placeOfBirth",
                                "value": "={{ $('Passport Application Form').item.json['Place_of_Birth'] }}",
                                "type": "string"
                            },
                            {
                                "id": "id-6",
                                "name": "nationalIdNumber",
                                "value": "={{ $('Passport Application Form').item.json['National_ID_Number'] }}",
                                "type": "string"
                            },
                            {
                                "id": "id-7",
                                "name": "phoneNumber",
                                "value": "={{ $('Passport Application Form').item.json['Phone_Number'] }}",
                                "type": "string"
                            },
                            {
                                "id": "id-8",
                                "name": "emailAddress",
                                "value": "={{ $('Passport Application Form').item.json['Email_Address'] }}",
                                "type": "string"
                            },
                            {
                                "id": "id-9",
                                "name": "currentAddress",
                                "value": "={{ $('Passport Application Form').item.json['Current_Address'] }}",
                                "type": "string"
                            },
                            {
                                "id": "id-10",
                                "name": "passportType",
                                "value": "={{ $('Service Type Selection Form').item.json['Passport_Type'] }}",
                                "type": "string"
                            },
                            {
                                "id": "id-11",
                                "name": "serviceSpeed",
                                "value": "={{ $('Service Type Selection Form').item.json['Service_Speed'] }}",
                                "type": "string"
                            },
                            {
                                "id": "id-12",
                                "name": "numberOfPages",
                                "value": "={{ $('Service Type Selection Form').item.json['Number_of_Pages'] }}",
                                "type": "string"
                            },
                            {
                                "id": "id-13",
                                "name": "specialRequests",
                                "value": "={{ $('Service Type Selection Form').item.json['Special_Requests_or_Notes'] || 'None' }}",
                                "type": "string"
                            },
                            {
                                "id": "id-14",
                                "name": "status",
                                "value": "Pending Review",
                                "type": "string"
                            }
                        ]
                    },
                    "options": {}
                },
                "id": "6fa550ac-209e-4625-b2c4-a376c3046c7d",
                "name": "Aggregate Application Data",
                "type": "n8n-nodes-base.set",
                "typeVersion": 3.4,
                "position": [
                    928,
                    496
                ]
            },
            {
                "parameters": {
                    "dataTableId": {
                        "__rl": true,
                        "mode": "list",
                        "value": "<__PLACEHOLDER_VALUE__passport_applications__>"
                    },
                    "columns": {
                        "mappingMode": "autoMapInputData",
                        "value": null
                    }
                },
                "id": "d0342b8c-d427-4fff-8d65-0f004da80c00",
                "name": "Store Application",
                "type": "n8n-nodes-base.dataTable",
                "typeVersion": 1.1,
                "position": [
                    1152,
                    496
                ]
            },
            {
                "parameters": {
                    "rules": {
                        "values": [
                            {
                                "conditions": {
                                    "options": {
                                        "caseSensitive": true,
                                        "leftValue": "",
                                        "typeValidation": "strict"
                                    },
                                    "conditions": [
                                        {
                                            "leftValue": "={{ $json.passportType }}",
                                            "rightValue": "Ordinary Passport",
                                            "operator": {
                                                "type": "string",
                                                "operation": "equals"
                                            }
                                        }
                                    ],
                                    "combinator": "and"
                                },
                                "renameOutput": true,
                                "outputKey": "Ordinary Passport"
                            },
                            {
                                "conditions": {
                                    "options": {
                                        "caseSensitive": true,
                                        "leftValue": "",
                                        "typeValidation": "strict"
                                    },
                                    "conditions": [
                                        {
                                            "leftValue": "={{ $json.passportType }}",
                                            "rightValue": "Official Passport",
                                            "operator": {
                                                "type": "string",
                                                "operation": "equals"
                                            }
                                        }
                                    ],
                                    "combinator": "and"
                                },
                                "renameOutput": true,
                                "outputKey": "Official Passport"
                            },
                            {
                                "conditions": {
                                    "options": {
                                        "caseSensitive": true,
                                        "leftValue": "",
                                        "typeValidation": "strict"
                                    },
                                    "conditions": [
                                        {
                                            "leftValue": "={{ $json.passportType }}",
                                            "rightValue": "Diplomatic Passport",
                                            "operator": {
                                                "type": "string",
                                                "operation": "equals"
                                            }
                                        }
                                    ],
                                    "combinator": "and"
                                },
                                "renameOutput": true,
                                "outputKey": "Diplomatic Passport"
                            }
                        ]
                    }
                },
                "id": "1b7ae171-f8eb-4aef-af4b-55ced4adfb30",
                "name": "Route by Passport Type",
                "type": "n8n-nodes-base.switch",
                "typeVersion": 3.4,
                "position": [
                    1376,
                    480
                ]
            },
            {
                "parameters": {
                    "assignments": {
                        "assignments": [
                            {
                                "id": "id-1",
                                "name": "emailSubject",
                                "value": "={{ 'Ordinary Passport Application Received - ' + $json.applicationId }}",
                                "type": "string"
                            },
                            {
                                "id": "id-2",
                                "name": "emailBody",
                                "value": "={{ 'Dear ' + $json.fullName + ',\\n\\nYour ordinary passport application has been successfully received.\\n\\nApplication Reference: ' + $json.applicationId + '\\nSubmission Date: ' + new Date($json.submissionDate).toLocaleDateString('en-GB') + '\\nPassport Type: ' + $json.passportType + '\\nService Speed: ' + $json.serviceSpeed + '\\nNumber of Pages: ' + $json.numberOfPages + '\\n\\nProcessing Timeline:\\n- Regular service: 10-15 business days\\n- Express service: 5-7 business days\\n- Urgent service: 2-3 business days\\n\\nNext Steps:\\n1. Your documents will be reviewed within 2 business days\\n2. You will receive a payment notification once approved\\n3. After payment confirmation, your passport will be processed\\n\\nPlease keep your application reference number for tracking.\\n\\nFor inquiries, contact:\\nLao PDR Passport Office\\nPhone: +856 21 XXX XXX\\nEmail: passport@gov.la\\n\\nThank you,\\nLao PDR Passport Services' }}",
                                "type": "string"
                            },
                            {
                                "id": "id-3",
                                "name": "recipientEmail",
                                "value": "={{ $json.emailAddress }}",
                                "type": "string"
                            },
                            {
                                "id": "id-4",
                                "name": "recipientName",
                                "value": "={{ $json.fullName }}",
                                "type": "string"
                            }
                        ]
                    },
                    "includeOtherFields": true,
                    "options": {}
                },
                "id": "13a94464-558f-4a54-ba72-6caf2a224521",
                "name": "Prepare Ordinary Notification",
                "type": "n8n-nodes-base.set",
                "typeVersion": 3.4,
                "position": [
                    1600,
                    304
                ]
            },
            {
                "parameters": {
                    "assignments": {
                        "assignments": [
                            {
                                "id": "id-1",
                                "name": "emailSubject",
                                "value": "={{ 'Official Passport Application Received - ' + $json.applicationId }}",
                                "type": "string"
                            },
                            {
                                "id": "id-2",
                                "name": "emailBody",
                                "value": "={{ 'Dear ' + $json.fullName + ',\\n\\nYour official passport application has been successfully received.\\n\\nApplication Reference: ' + $json.applicationId + '\\nSubmission Date: ' + new Date($json.submissionDate).toLocaleDateString('en-GB') + '\\nPassport Type: ' + $json.passportType + '\\nService Speed: ' + $json.serviceSpeed + '\\nNumber of Pages: ' + $json.numberOfPages + '\\n\\nOfficial Passport Processing:\\nYour application requires additional verification and approval from the Ministry of Foreign Affairs. Processing time may vary based on verification requirements.\\n\\nNext Steps:\\n1. Document verification (2-3 business days)\\n2. Ministry approval process (5-7 business days)\\n3. Payment notification\\n4. Passport issuance\\n\\nRequired Additional Documents (if applicable):\\n- Official letter from your government department\\n- Employment verification\\n\\nPlease keep your application reference number for tracking.\\n\\nFor inquiries, contact:\\nLao PDR Passport Office - Official Services\\nPhone: +856 21 XXX XXX\\nEmail: official.passport@gov.la\\n\\nThank you,\\nLao PDR Passport Services' }}",
                                "type": "string"
                            },
                            {
                                "id": "id-3",
                                "name": "recipientEmail",
                                "value": "={{ $json.emailAddress }}",
                                "type": "string"
                            },
                            {
                                "id": "id-4",
                                "name": "recipientName",
                                "value": "={{ $json.fullName }}",
                                "type": "string"
                            }
                        ]
                    },
                    "includeOtherFields": true,
                    "options": {}
                },
                "id": "a5e8d50a-28af-4777-8a20-72afd77b21f6",
                "name": "Prepare Official Notification",
                "type": "n8n-nodes-base.set",
                "typeVersion": 3.4,
                "position": [
                    1600,
                    496
                ]
            },
            {
                "parameters": {
                    "assignments": {
                        "assignments": [
                            {
                                "id": "id-1",
                                "name": "emailSubject",
                                "value": "={{ 'Diplomatic Passport Application Received - ' + $json.applicationId }}",
                                "type": "string"
                            },
                            {
                                "id": "id-2",
                                "name": "emailBody",
                                "value": "={{ 'Dear ' + $json.fullName + ',\\n\\nYour diplomatic passport application has been successfully received.\\n\\nApplication Reference: ' + $json.applicationId + '\\nSubmission Date: ' + new Date($json.submissionDate).toLocaleDateString('en-GB') + '\\nPassport Type: ' + $json.passportType + '\\nService Speed: ' + $json.serviceSpeed + '\\nNumber of Pages: ' + $json.numberOfPages + '\\n\\nDiplomatic Passport Processing:\\nYour application requires high-level verification and approval from the Ministry of Foreign Affairs. This is a priority service with enhanced security protocols.\\n\\nNext Steps:\\n1. Security clearance verification (2-3 business days)\\n2. Ministry of Foreign Affairs approval (3-5 business days)\\n3. Diplomatic credentials verification\\n4. Priority passport issuance\\n\\nRequired Documents:\\n- Diplomatic appointment letter\\n- Ministry authorization\\n- Security clearance certificate\\n\\nYour application will be handled with priority. A dedicated officer will contact you within 24 hours.\\n\\nFor urgent inquiries, contact:\\nLao PDR Passport Office - Diplomatic Services\\nPhone: +856 21 XXX XXX (Priority Line)\\nEmail: diplomatic.passport@gov.la\\n\\nThank you,\\nLao PDR Passport Services - Diplomatic Division' }}",
                                "type": "string"
                            },
                            {
                                "id": "id-3",
                                "name": "recipientEmail",
                                "value": "={{ $json.emailAddress }}",
                                "type": "string"
                            },
                            {
                                "id": "id-4",
                                "name": "recipientName",
                                "value": "={{ $json.fullName }}",
                                "type": "string"
                            }
                        ]
                    },
                    "includeOtherFields": true,
                    "options": {}
                },
                "id": "180bc35c-d273-4c4b-8bf2-3700cf257046",
                "name": "Prepare Diplomatic Notification",
                "type": "n8n-nodes-base.set",
                "typeVersion": 3.4,
                "position": [
                    1600,
                    688
                ]
            },
            {
                "parameters": {
                    "fromEmail": "Lao PDR Passport Services <passport@gov.la>",
                    "toEmail": "={{ $json.recipientEmail }}",
                    "subject": "={{ $json.emailSubject }}",
                    "emailFormat": "text",
                    "text": "={{ $json.emailBody }}",
                    "options": {}
                },
                "id": "22867def-8b41-4cb1-a711-9dbf5903546f",
                "name": "Send Confirmation Email",
                "type": "n8n-nodes-base.emailSend",
                "typeVersion": 2.1,
                "position": [
                    1824,
                    496
                ],
                "webhookId": "59877f5b-3aea-4efc-974a-c9e47686846e"
            }
        ],
        "connections": {
            "Passport Application Form": {
                "main": [
                    [
                        {
                            "node": "Document Upload Form",
                            "type": "main",
                            "index": 0
                        }
                    ]
                ]
            },
            "Document Upload Form": {
                "main": [
                    [
                        {
                            "node": "Service Type Selection Form",
                            "type": "main",
                            "index": 0
                        }
                    ]
                ]
            },
            "Service Type Selection Form": {
                "main": [
                    [
                        {
                            "node": "Aggregate Application Data",
                            "type": "main",
                            "index": 0
                        }
                    ]
                ]
            },
            "Aggregate Application Data": {
                "main": [
                    [
                        {
                            "node": "Store Application",
                            "type": "main",
                            "index": 0
                        }
                    ]
                ]
            },
            "Store Application": {
                "main": [
                    [
                        {
                            "node": "Route by Passport Type",
                            "type": "main",
                            "index": 0
                        }
                    ]
                ]
            },
            "Route by Passport Type": {
                "main": [
                    [
                        {
                            "node": "Prepare Ordinary Notification",
                            "type": "main",
                            "index": 0
                        }
                    ],
                    [
                        {
                            "node": "Prepare Official Notification",
                            "type": "main",
                            "index": 0
                        }
                    ],
                    [
                        {
                            "node": "Prepare Diplomatic Notification",
                            "type": "main",
                            "index": 0
                        }
                    ]
                ]
            },
            "Prepare Ordinary Notification": {
                "main": [
                    [
                        {
                            "node": "Send Confirmation Email",
                            "type": "main",
                            "index": 0
                        }
                    ]
                ]
            },
            "Prepare Official Notification": {
                "main": [
                    [
                        {
                            "node": "Send Confirmation Email",
                            "type": "main",
                            "index": 0
                        }
                    ]
                ]
            },
            "Prepare Diplomatic Notification": {
                "main": [
                    [
                        {
                            "node": "Send Confirmation Email",
                            "type": "main",
                            "index": 0
                        }
                    ]
                ]
            }
        },
        "settings": {
            "executionOrder": "v1",
            "binaryMode": "separate",
            "availableInMCP": false
        },
        "staticData": null,
        "meta": null,
        "pinData": {},
        "versionId": "912987b2-7c59-4c1b-8f97-8b1fde34998d",
        "activeVersionId": null,
        "versionCounter": 2,
        "triggerCount": 0,
        "tags": [],
        "parentFolder": null,
        "activeVersion": null,
        "homeProject": {
            "id": "2L26TXIV8V78IBV4",
            "type": "team",
            "name": "My project",
            "icon": {
                "type": "icon",
                "value": "layers"
            }
        },
        "sharedWithProjects": [],
        "usedCredentials": [],
        "scopes": [
            "workflow:create",
            "workflow:delete",
            "workflow:execute",
            "workflow:execute-chat",
            "workflow:list",
            "workflow:move",
            "workflow:publish",
            "workflow:read",
            "workflow:share",
            "workflow:update"
        ],
        "checksum": "9cebb5371c99173106fb17607f2933b0899a43ea5ff1bc91e83267c0692b7c8b"
    }
}

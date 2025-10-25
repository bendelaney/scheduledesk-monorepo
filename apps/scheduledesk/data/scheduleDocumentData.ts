import {
  JobVisit,
  ScheduleDay,
  ScheduleDocument,
  JobVisitConfirmationStatus,
  TeamMemberInstance
} from "types";
import { format, parseISO } from 'date-fns';
import TeamMembersData from "./teamMembersData";
import APP_SETTINGS from "./appSettings";

// //////////////////////////////////////////////////////////
// This is the GraphQL query that is used to get the Job Visits for a specific date range.
/*
query VisitsByDateRange_Detailed {
  visits(
    filter: {
      startAt: {
        after: "2024-05-19T00:00:00",
        before: "2024-05-23T23:59:00"
      }
      status:ACTIVE
    }
    sort: {
      key:START_AT
      direction: ASCENDING
    }
    timezone: "America/Los_Angeles"
  ) {
    edges {
      node {
        id
        title
        startAt
        endAt
        instructions
        assignedUsers(first:18) {
          nodes {
            id
            name {
              full
            }
          }
        }
        client {
          id
          firstName
          lastName
          emails {
            address
            primary
          }
          phones {
            number
            primary
            smsAllowed
          }
          companyName
        }
        property {
          id
          address {
            street
            city
            province
            postalCode
            coordinates {
              latitudeString
              longitudeString
            }
          }
        }          
        job {
          id
          jobberWebUri
          jobNumber
          total
          salesperson {
            name { first }
          }
          customFields {
            __typename
            ... on CustomFieldText {
              label
              valueText
            }
          }
        }
      }
    }
  }
}
*/

// This is the RAW JSON DATA that is returned from the query, 
// passing in the date range of March 4th, 2024 to March 7th, 2024.:
const rawVisitsDATA = {
  "data": {
    "visits": {
      "edges": [
        {
          "node": {
            "id": "Z2lkOi8vSm9iYmVyL1Zpc2l0Lzg0MTIzMzkyNg==",
            "title": "√=Martz - SC - 1312 E Overbluff - 1P/1Sh/1G 1Day",
            "visitStatus": "COMPLETED",
            "startAt": "2024-07-08T14:00:00Z",
            "endAt": "2024-07-08T22:30:00Z",
            "allDay": false,
            "instructions": "👉🏼Krystn\r\n🚚Felix, later \r\n\r\n[She asked us about work on her neighbors tree that is hanging over the property. I told her we would evaluate on Monday and decide whether it's something we can fit in or whether we need to come back for that. She will be paying for it.]\r\n\r\nAnnual Visit \r\nShearing (Spirea later in season)\r\nBeauty bushes deadwooded, lilacs deadwooded and reductions where possible. Japanese maple to the east severly declining. Shrubs sheared, apple tree pruned. \r\n\r\nJV",
            "assignedUsers": {
              "nodes": [
                {
                  "id": "Z2lkOi8vSm9iYmVyL1VzZXIvOTExMjIy",
                  "name": {
                    "full": "Felix Gayton"
                  }
                },
                {
                  "id": "Z2lkOi8vSm9iYmVyL1VzZXIvNDU0NzYw",
                  "name": {
                    "full": "Krystn Parmley"
                  }
                },
                {
                  "id": "Z2lkOi8vSm9iYmVyL1VzZXIvMjAzMDkzMg==",
                  "name": {
                    "full": "Madeleine Hooker"
                  }
                },
                {
                  "id": "Z2lkOi8vSm9iYmVyL1VzZXIvNDc1NDUx",
                  "name": {
                    "full": "Tal Weisenburger"
                  }
                }
              ]
            },
            "client": {
              "id": "Z2lkOi8vSm9iYmVyL0NsaWVudC8xODg1MzUxMA==",
              "name": "Joyce Martz",
              "firstName": "Joyce",
              "lastName": "Martz",
              "emails": [
                {
                  "address": "garce95@gmail.com",
                  "primary": true
                }
              ],
              "phones": [
                {
                  "number": "509-995-4089",
                  "primary": true,
                  "smsAllowed": true
                }
              ],
              "companyName": "Joyce Martz"
            },
            "property": {
              "id": "Z2lkOi8vSm9iYmVyL1Byb3BlcnR5LzE5OTA5NTk3",
              "address": {
                "street": "1312  east overbluff",
                "city": "Spokane",
                "province": "WA",
                "postalCode": "99203",
                "coordinates": {
                  "latitudeString": "47.6351907",
                  "longitudeString": "-117.3909947"
                }
              }
            },
            "job": {
              "id": "Z2lkOi8vSm9iYmVyL0pvYi8yMDQ1MzQwNw==",
              "jobberWebUri": "https://secure.getjobber.com/work_orders/20453407",
              "jobNumber": 686,
              "total": 0,
              "salesperson": null,
              "customFields": [
                {
                  "__typename": "CustomFieldText",
                  "label": "Job Information",
                  "valueText": ""
                },
                {
                  "__typename": "CustomFieldText",
                  "label": "Misc",
                  "valueText": ""
                },
                {
                  "__typename": "CustomFieldText",
                  "label": "Bidder",
                  "valueText": ""
                },
                {
                  "__typename": "CustomFieldText",
                  "label": "Referred By",
                  "valueText": ""
                }
              ]
            }
          }
        },
        {
          "node": {
            "id": "Z2lkOi8vSm9iYmVyL1Zpc2l0LzE0MTMxNDI0Mjc=",
            "title": "~Fasules -S- 204 W 16th - 2C/1G 1d",
            "visitStatus": "COMPLETED",
            "startAt": "2024-07-08T14:00:00Z",
            "endAt": "2024-07-08T22:00:00Z",
            "allDay": false,
            "instructions": "Felix🚚\r\n\r\n--Horse Chestnut East side of House: canopy clean to .5\" and spacing. 2ft? lift\r\n-- Two Street Maples in front: 3hrs in each tree getting large dead and Hazards. \r\n-- Two Lace leaf maple in back: small one, clean and prune for form\r\n--Dead arbs on back wall remove\r\nKelly",
            "assignedUsers": {
              "nodes": [
                {
                  "id": "Z2lkOi8vSm9iYmVyL1VzZXIvMzY4Mzkz",
                  "name": {
                    "full": "Ben Delaney"
                  }
                },
                {
                  "id": "Z2lkOi8vSm9iYmVyL1VzZXIvOTExMjIy",
                  "name": {
                    "full": "Felix Gayton"
                  }
                },
                {
                  "id": "Z2lkOi8vSm9iYmVyL1VzZXIvMTgxMjY4OQ==",
                  "name": {
                    "full": "Omar Sierra"
                  }
                }
              ]
            },
            "client": {
              "id": "Z2lkOi8vSm9iYmVyL0NsaWVudC8xODg1MzU2Mw==",
              "name": "Ken Fasules",
              "firstName": "Ken",
              "lastName": "Fasules",
              "emails": [
                {
                  "address": "ken@vehrsinc.com",
                  "primary": false
                },
                {
                  "address": "kenfasules@gmail.com",
                  "primary": true
                }
              ],
              "phones": [
                {
                  "number": "(509) 370-9312",
                  "primary": true,
                  "smsAllowed": true
                }
              ],
              "companyName": null
            },
            "property": {
              "id": "Z2lkOi8vSm9iYmVyL1Byb3BlcnR5LzQwODcxNTQ5",
              "address": {
                "street": "628 W. 15th",
                "city": "Spokane",
                "province": "Wa",
                "postalCode": "99202",
                "coordinates": {
                  "latitudeString": "47.64199989999999",
                  "longitudeString": "-117.4218257"
                }
              }
            },
            "job": {
              "id": "Z2lkOi8vSm9iYmVyL0pvYi84OTkwNjc5Mg==",
              "jobberWebUri": "https://secure.getjobber.com/work_orders/89906792",
              "jobNumber": 4359,
              "total": 1600,
              "salesperson": null,
              "customFields": [
                {
                  "__typename": "CustomFieldText",
                  "label": "Job Information",
                  "valueText": ""
                },
                {
                  "__typename": "CustomFieldText",
                  "label": "Misc",
                  "valueText": ""
                },
                {
                  "__typename": "CustomFieldText",
                  "label": "Bidder",
                  "valueText": "Kelly"
                },
                {
                  "__typename": "CustomFieldText",
                  "label": "Referred By",
                  "valueText": ""
                }
              ]
            }
          }
        },
        {
          "node": {
            "id": "Z2lkOi8vSm9iYmVyL1Zpc2l0LzE0NDM3MDA4NTM=",
            "title": "Voth -S- 954 E 14th -1C/1P 5.5H",
            "visitStatus": "COMPLETED",
            "startAt": "2024-07-08T14:00:00Z",
            "endAt": "2024-07-08T19:30:00Z",
            "allDay": false,
            "instructions": "👉🏼🛻Jose: 4 Sheets of OSB\r\n🚛Peter - 12 ft ladder\r\n\r\nPruning of conifer trees around the house that are in close proximity to the roof or are in contact with the roof. Pruning to achieve 2.5-5.5ft of clearance where appropriate. Lodgepole pine to the right of the front door removing the dead branches off the stem up to 18 ft from the ground, any dead branches higher than that will be left for wildlife habitat.\r\n\r\nSee photos\r\nJose",
            "assignedUsers": {
              "nodes": [
                {
                  "id": "Z2lkOi8vSm9iYmVyL1VzZXIvMzY5NTA5",
                  "name": {
                    "full": "Jose Villa"
                  }
                },
                {
                  "id": "Z2lkOi8vSm9iYmVyL1VzZXIvMTg5NjI2OA==",
                  "name": {
                    "full": "Peter Sherman"
                  }
                }
              ]
            },
            "client": {
              "id": "Z2lkOi8vSm9iYmVyL0NsaWVudC84NTkzODM4Ng==",
              "name": "Lisa Voth",
              "firstName": "Lisa",
              "lastName": "Voth",
              "emails": [
                {
                  "address": "lvoth07@gmail.com",
                  "primary": true
                }
              ],
              "phones": [
                {
                  "number": "303-883-3926",
                  "primary": true,
                  "smsAllowed": true
                }
              ],
              "companyName": null
            },
            "property": {
              "id": "Z2lkOi8vSm9iYmVyL1Byb3BlcnR5LzkyNjQxNjA1",
              "address": {
                "street": "954 East 14th Avenue",
                "city": "Spokane",
                "province": "Washington",
                "postalCode": "99202",
                "coordinates": {
                  "latitudeString": "47.6423904",
                  "longitudeString": "-117.396569"
                }
              }
            },
            "job": {
              "id": "Z2lkOi8vSm9iYmVyL0pvYi85MjIyMDM0Ng==",
              "jobberWebUri": "https://secure.getjobber.com/work_orders/92220346",
              "jobNumber": 4467,
              "total": 1095,
              "salesperson": null,
              "customFields": [
                {
                  "__typename": "CustomFieldText",
                  "label": "Job Information",
                  "valueText": ""
                },
                {
                  "__typename": "CustomFieldText",
                  "label": "Misc",
                  "valueText": ""
                },
                {
                  "__typename": "CustomFieldText",
                  "label": "Bidder",
                  "valueText": "Jose"
                },
                {
                  "__typename": "CustomFieldText",
                  "label": "Referred By",
                  "valueText": ""
                }
              ]
            }
          }
        },
        {
          "node": {
            "id": "Z2lkOi8vSm9iYmVyL1Zpc2l0LzE0NTUyMjQ5MTk=",
            "title": "Taylor -C- 530 S Cowley St",
            "visitStatus": "COMPLETED",
            "startAt": "2024-07-08T16:00:00Z",
            "endAt": "2024-07-08T18:00:00Z",
            "allDay": false,
            "instructions": "Oversee planting of 5 Zelkova ",
            "assignedUsers": {
              "nodes": [
                {
                  "id": "Z2lkOi8vSm9iYmVyL1VzZXIvNDU0NzYw",
                  "name": {
                    "full": "Krystn Parmley"
                  }
                },
                {
                  "id": "Z2lkOi8vSm9iYmVyL1VzZXIvMzY4Mzkx",
                  "name": {
                    "full": "Kelly Chadwick"
                  }
                }
              ]
            },
            "client": {
              "id": "Z2lkOi8vSm9iYmVyL0NsaWVudC8xODg1MzY3MA==",
              "name": "Mark Taylor",
              "firstName": "Mark",
              "lastName": "Taylor",
              "emails": [
                {
                  "address": "elscomark@yahoo.com",
                  "primary": true
                }
              ],
              "phones": [
                {
                  "number": "509-443-1077",
                  "primary": true,
                  "smsAllowed": true
                }
              ],
              "companyName": "Aqua Pacific"
            },
            "property": {
              "id": "Z2lkOi8vSm9iYmVyL1Byb3BlcnR5Lzk0NTgxMjM1",
              "address": {
                "street": "530 South Cowley Street",
                "city": "Spokane",
                "province": "Washington",
                "postalCode": "99202",
                "coordinates": {
                  "latitudeString": "47.6505331",
                  "longitudeString": "-117.4086251"
                }
              }
            },
            "job": {
              "id": "Z2lkOi8vSm9iYmVyL0pvYi85MzE0MTMxMw==",
              "jobberWebUri": "https://secure.getjobber.com/work_orders/93141313",
              "jobNumber": 4496,
              "total": 90,
              "salesperson": null,
              "customFields": [
                {
                  "__typename": "CustomFieldText",
                  "label": "Job Information",
                  "valueText": ""
                },
                {
                  "__typename": "CustomFieldText",
                  "label": "Misc",
                  "valueText": ""
                },
                {
                  "__typename": "CustomFieldText",
                  "label": "Bidder",
                  "valueText": ""
                },
                {
                  "__typename": "CustomFieldText",
                  "label": "Referred By",
                  "valueText": ""
                }
              ]
            }
          }
        },
        {
          "node": {
            "id": "Z2lkOi8vSm9iYmVyL1Zpc2l0LzE0NjQzMTc2Njc=",
            "title": "Robinson -s-409 West 29th Ave",
            "visitStatus": "COMPLETED",
            "startAt": "2024-07-10T20:00:00Z",
            "endAt": "2024-07-10T22:00:00Z",
            "allDay": false,
            "instructions": "prune Japanese Maple dead and a little in the Spruce",
            "assignedUsers": {
              "nodes": [
                {
                  "id": "Z2lkOi8vSm9iYmVyL1VzZXIvNDc1NDUx",
                  "name": {
                    "full": "Tal Weisenburger"
                  }
                }
              ]
            },
            "client": {
              "id": "Z2lkOi8vSm9iYmVyL0NsaWVudC84Nzk3ODc1Ng==",
              "name": "Marsha Robinson",
              "firstName": "Marsha",
              "lastName": "Robinson",
              "emails": [
                {
                  "address": "itoast2life@gmail.com",
                  "primary": true
                }
              ],
              "phones": [
                {
                  "number": "509-499-9065",
                  "primary": true,
                  "smsAllowed": true
                }
              ],
              "companyName": null
            },
            "property": {
              "id": "Z2lkOi8vSm9iYmVyL1Byb3BlcnR5Lzk0ODA2MDgy",
              "address": {
                "street": "409 West 29th Avenue",
                "city": "Spokane",
                "province": "Washington",
                "postalCode": "99203",
                "coordinates": {
                  "latitudeString": "47.6273402",
                  "longitudeString": "-117.4183607"
                }
              }
            },
            "job": {
              "id": "Z2lkOi8vSm9iYmVyL0pvYi85Mzg1MzM1MQ==",
              "jobberWebUri": "https://secure.getjobber.com/work_orders/93853351",
              "jobNumber": 4534,
              "total": 160,
              "salesperson": null,
              "customFields": [
                {
                  "__typename": "CustomFieldText",
                  "label": "Job Information",
                  "valueText": ""
                },
                {
                  "__typename": "CustomFieldText",
                  "label": "Misc",
                  "valueText": ""
                },
                {
                  "__typename": "CustomFieldText",
                  "label": "Bidder",
                  "valueText": "Kelly"
                },
                {
                  "__typename": "CustomFieldText",
                  "label": "Referred By",
                  "valueText": ""
                }
              ]
            }
          }
        },
        {
          "node": {
            "id": "Z2lkOi8vSm9iYmVyL1Zpc2l0LzE0NjEyNDQ2ODc=",
            "title": "?????",
            "visitStatus": "COMPLETED",
            "startAt": "2024-07-10T21:00:00Z",
            "endAt": "2024-07-10T23:00:00Z",
            "allDay": false,
            "instructions": "??",
            "assignedUsers": {
              "nodes": [
                {
                  "id": "Z2lkOi8vSm9iYmVyL1VzZXIvNDc1NDUx",
                  "name": {
                    "full": "Tal Weisenburger"
                  }
                }
              ]
            },
            "client": {
              "id": "Z2lkOi8vSm9iYmVyL0NsaWVudC84Nzk3ODc1Ng==",
              "name": "Marsha Robinson",
              "firstName": "Marsha",
              "lastName": "Robinson",
              "emails": [
                {
                  "address": "itoast2life@gmail.com",
                  "primary": true
                }
              ],
              "phones": [
                {
                  "number": "509-499-9065",
                  "primary": true,
                  "smsAllowed": true
                }
              ],
              "companyName": null
            },
            "property": {
              "id": "Z2lkOi8vSm9iYmVyL1Byb3BlcnR5Lzk0ODA2MDgy",
              "address": {
                "street": "409 West 29th Avenue",
                "city": "Spokane",
                "province": "Washington",
                "postalCode": "99203",
                "coordinates": {
                  "latitudeString": "47.6273402",
                  "longitudeString": "-117.4183607"
                }
              }
            },
            "job": {
              "id": "Z2lkOi8vSm9iYmVyL0pvYi85MzYxNjE5OQ==",
              "jobberWebUri": "https://secure.getjobber.com/work_orders/93616199",
              "jobNumber": 4521,
              "total": 160,
              "salesperson": null,
              "customFields": [
                {
                  "__typename": "CustomFieldText",
                  "label": "Job Information",
                  "valueText": ""
                },
                {
                  "__typename": "CustomFieldText",
                  "label": "Misc",
                  "valueText": ""
                },
                {
                  "__typename": "CustomFieldText",
                  "label": "Bidder",
                  "valueText": "Kelly"
                },
                {
                  "__typename": "CustomFieldText",
                  "label": "Referred By",
                  "valueText": ""
                }
              ]
            }
          }
        },
        {
          "node": {
            "id": "Z2lkOi8vSm9iYmVyL1Zpc2l0LzE0NjE1MzIzNDA=",
            "title": "Slouffman -SEF- 4114 E 46th Ct - 1C/1P 5h",
            "visitStatus": "COMPLETED",
            "startAt": "2024-07-11T13:15:00Z",
            "endAt": "2024-07-11T14:00:00Z",
            "allDay": false,
            "instructions": "Chip",
            "assignedUsers": {
              "nodes": [
                {
                  "id": "Z2lkOi8vSm9iYmVyL1VzZXIvNjAzMzI2",
                  "name": {
                    "full": "Zayren Bubb"
                  }
                },
                {
                  "id": "Z2lkOi8vSm9iYmVyL1VzZXIvOTExMjIy",
                  "name": {
                    "full": "Felix Gayton"
                  }
                }
              ]
            },
            "client": {
              "id": "Z2lkOi8vSm9iYmVyL0NsaWVudC8zNjg2NjgxMw==",
              "name": "Bill Slouffman",
              "firstName": "Bill",
              "lastName": "Slouffman",
              "emails": [
                {
                  "address": "billslouf@comcast.net",
                  "primary": true
                }
              ],
              "phones": [
                {
                  "number": "509-448-1426",
                  "primary": true,
                  "smsAllowed": false
                }
              ],
              "companyName": null
            },
            "property": {
              "id": "Z2lkOi8vSm9iYmVyL1Byb3BlcnR5LzM5NzQ5NDk1",
              "address": {
                "street": "4114 east 46th court",
                "city": "spokane",
                "province": "WA",
                "postalCode": "99223",
                "coordinates": {
                  "latitudeString": "47.6107889",
                  "longitudeString": "-117.3489355"
                }
              }
            },
            "job": {
              "id": "Z2lkOi8vSm9iYmVyL0pvYi85MTMyOTgxMA==",
              "jobberWebUri": "https://secure.getjobber.com/work_orders/91329810",
              "jobNumber": 4433,
              "total": 1400,
              "salesperson": null,
              "customFields": [
                {
                  "__typename": "CustomFieldText",
                  "label": "Job Information",
                  "valueText": ""
                },
                {
                  "__typename": "CustomFieldText",
                  "label": "Misc",
                  "valueText": ""
                },
                {
                  "__typename": "CustomFieldText",
                  "label": "Bidder",
                  "valueText": "Ben"
                },
                {
                  "__typename": "CustomFieldText",
                  "label": "Referred By",
                  "valueText": ""
                }
              ]
            }
          }
        },
        {
          "node": {
            "id": "Z2lkOi8vSm9iYmVyL1Zpc2l0LzE0MjA1MDQwOTk=",
            "title": "~Wagner -NW- 3327 W Glass - 1C 3.5h, 1G 1h",
            "visitStatus": "COMPLETED",
            "startAt": "2024-07-11T14:00:00Z",
            "endAt": "2024-07-11T16:30:00Z",
            "allDay": false,
            "instructions": "🚒Omar+DT\r\n\r\nClear Norway Maplex3 in backyard(each of these trees is probably 8-10” diameter) from power line and shop. Photos. IC.",
            "assignedUsers": {
              "nodes": [
                {
                  "id": "Z2lkOi8vSm9iYmVyL1VzZXIvOTExMjIy",
                  "name": {
                    "full": "Felix Gayton"
                  }
                },
                {
                  "id": "Z2lkOi8vSm9iYmVyL1VzZXIvNjAzMzI2",
                  "name": {
                    "full": "Zayren Bubb"
                  }
                }
              ]
            },
            "client": {
              "id": "Z2lkOi8vSm9iYmVyL0NsaWVudC84NDE4ODIzMw==",
              "name": "Property Management Partners",
              "firstName": "Jennifer ",
              "lastName": "Wagner ",
              "emails": [
                {
                  "address": "jen@pmpspokane.com",
                  "primary": true
                }
              ],
              "phones": [
                {
                  "number": "509-435-1519",
                  "primary": true,
                  "smsAllowed": true
                }
              ],
              "companyName": "Property Management Partners"
            },
            "property": {
              "id": "Z2lkOi8vSm9iYmVyL1Byb3BlcnR5LzkwODE3NTc0",
              "address": {
                "street": "3327 West Glass Avenue",
                "city": "Spokane",
                "province": "Washington",
                "postalCode": "99205",
                "coordinates": {
                  "latitudeString": "47.6896671",
                  "longitudeString": "-117.4605488"
                }
              }
            },
            "job": {
              "id": "Z2lkOi8vSm9iYmVyL0pvYi85MDQ3NjQwOA==",
              "jobberWebUri": "https://secure.getjobber.com/work_orders/90476408",
              "jobNumber": 4403,
              "total": 598.5,
              "salesperson": null,
              "customFields": [
                {
                  "__typename": "CustomFieldText",
                  "label": "Job Information",
                  "valueText": ""
                },
                {
                  "__typename": "CustomFieldText",
                  "label": "Misc",
                  "valueText": ""
                },
                {
                  "__typename": "CustomFieldText",
                  "label": "Bidder",
                  "valueText": "Isaiah"
                },
                {
                  "__typename": "CustomFieldText",
                  "label": "Referred By",
                  "valueText": "one of her clients used us in the past"
                }
              ]
            }
          }
        },
        {
          "node": {
            "id": "Z2lkOi8vSm9iYmVyL1Zpc2l0LzE0MzI1ODM4Mjg=",
            "title": "Akre -V- 5124 N Hutton View Ln - 2P 3h",
            "visitStatus": "COMPLETED",
            "startAt": "2024-07-11T14:00:00Z",
            "endAt": "2024-07-11T18:00:00Z",
            "allDay": false,
            "instructions": "🚚Peter\r\n\r\n10’+ AND 14+’ LADDER\r\nHawthorne in front. She wants it a bit more shapely. Reduce ends and shape for uniform appearance. Make several judicious cuts in the interior to open up space. \r\n2P 2h\r\n\r\nRemove flat top arb. \r\n15m\r\n\r\n[Ben: schedule Jacob Stump Grinder when scheduling]\r\n\r\nBD",
            "assignedUsers": {
              "nodes": [
                {
                  "id": "Z2lkOi8vSm9iYmVyL1VzZXIvMzY5NTA5",
                  "name": {
                    "full": "Jose Villa"
                  }
                },
                {
                  "id": "Z2lkOi8vSm9iYmVyL1VzZXIvMTg5NjI2OA==",
                  "name": {
                    "full": "Peter Sherman"
                  }
                },
                {
                  "id": "Z2lkOi8vSm9iYmVyL1VzZXIvNjAzMzI2",
                  "name": {
                    "full": "Zayren Bubb"
                  }
                },
                {
                  "id": "Z2lkOi8vSm9iYmVyL1VzZXIvOTExMjIy",
                  "name": {
                    "full": "Felix Gayton"
                  }
                }
              ]
            },
            "client": {
              "id": "Z2lkOi8vSm9iYmVyL0NsaWVudC81NzUyNjg4Nw==",
              "name": "Susan Akre",
              "firstName": "Susan",
              "lastName": "Akre",
              "emails": [
                {
                  "address": "akresusan@yahoo.com",
                  "primary": true
                }
              ],
              "phones": [
                {
                  "number": "480-294-1311",
                  "primary": true,
                  "smsAllowed": true
                }
              ],
              "companyName": null
            },
            "property": {
              "id": "Z2lkOi8vSm9iYmVyL1Byb3BlcnR5LzYyMjAzNDA0",
              "address": {
                "street": "5124 North Hutton View Lane",
                "city": "Spokane",
                "province": "Washington",
                "postalCode": "99212",
                "coordinates": {
                  "latitudeString": "47.7038261",
                  "longitudeString": "-117.2856921"
                }
              }
            },
            "job": {
              "id": "Z2lkOi8vSm9iYmVyL0pvYi85MTM1NjYzNQ==",
              "jobberWebUri": "https://secure.getjobber.com/work_orders/91356635",
              "jobNumber": 4439,
              "total": 785,
              "salesperson": null,
              "customFields": [
                {
                  "__typename": "CustomFieldText",
                  "label": "Job Information",
                  "valueText": ""
                },
                {
                  "__typename": "CustomFieldText",
                  "label": "Misc",
                  "valueText": ""
                },
                {
                  "__typename": "CustomFieldText",
                  "label": "Bidder",
                  "valueText": "Ben"
                },
                {
                  "__typename": "CustomFieldText",
                  "label": "Referred By",
                  "valueText": "robin wolfe -daughter in law "
                }
              ]
            }
          }
        },
        {
          "node": {
            "id": "Z2lkOi8vSm9iYmVyL1Zpc2l0LzE0NTU3OTA4NzE=",
            "title": "Dringle -C- 104 W 8th Ave - 1P/1C* 1d",
            "visitStatus": "COMPLETED",
            "startAt": "2024-07-11T14:00:00Z",
            "endAt": "2024-07-11T22:00:00Z",
            "allDay": false,
            "instructions": "🚚Peter or Zayren, later \r\n--West row of trees and shrubs along wall: thinning suckers, large dead removed, trees pruned for hazards \r\n--Maple at end trained and thinning \r\n--All shrubs: Dead removed, errant branches cut back\r\n-- Planting 3 linden trees \r\nKelly",
            "assignedUsers": {
              "nodes": [
                {
                  "id": "Z2lkOi8vSm9iYmVyL1VzZXIvNDc1NDUx",
                  "name": {
                    "full": "Tal Weisenburger"
                  }
                },
                {
                  "id": "Z2lkOi8vSm9iYmVyL1VzZXIvMzY5NTA5",
                  "name": {
                    "full": "Jose Villa"
                  }
                }
              ]
            },
            "client": {
              "id": "Z2lkOi8vSm9iYmVyL0NsaWVudC8xOTMwOTg2Nw==",
              "name": "Mark Dringle",
              "firstName": "Mark",
              "lastName": "Dringle",
              "emails": [
                {
                  "address": "mark@alcspokane.com",
                  "primary": true
                },
                {
                  "address": "pbolton@bakerconstruct.com",
                  "primary": false
                }
              ],
              "phones": [
                {
                  "number": "509-570-4005 cell",
                  "primary": false,
                  "smsAllowed": true
                },
                {
                  "number": "509-891-2339 office",
                  "primary": true,
                  "smsAllowed": false
                }
              ],
              "companyName": "Ace Landscape"
            },
            "property": {
              "id": "Z2lkOi8vSm9iYmVyL1Byb3BlcnR5LzkxMDY4OTA0",
              "address": {
                "street": "104 West 8th Ave",
                "city": "Spokane",
                "province": "Washington",
                "postalCode": "99204",
                "coordinates": {
                  "latitudeString": "47.6486502",
                  "longitudeString": "-117.4137149"
                }
              }
            },
            "job": {
              "id": "Z2lkOi8vSm9iYmVyL0pvYi85MzE4ODMzNw==",
              "jobberWebUri": "https://secure.getjobber.com/work_orders/93188337",
              "jobNumber": 4499,
              "total": 1730,
              "salesperson": null,
              "customFields": [
                {
                  "__typename": "CustomFieldText",
                  "label": "Job Information",
                  "valueText": ""
                },
                {
                  "__typename": "CustomFieldText",
                  "label": "Misc",
                  "valueText": ""
                },
                {
                  "__typename": "CustomFieldText",
                  "label": "Bidder",
                  "valueText": "Kelly"
                },
                {
                  "__typename": "CustomFieldText",
                  "label": "Referred By",
                  "valueText": ""
                }
              ]
            }
          }
        },
        {
          "node": {
            "id": "Z2lkOi8vSm9iYmVyL1Zpc2l0LzE0NTYyODI2NDE=",
            "title": "🌳 Randel -S- 50 W 23rd - 2P 1d",
            "visitStatus": "COMPLETED",
            "startAt": "2024-07-11T14:00:00Z",
            "endAt": "2024-07-11T22:30:00Z",
            "allDay": false,
            "instructions": "🚒Omar+DT, arriving later \r\nSHORT + EXTENDED SHEARS\r\n\r\n2 Flowering Plums- along the road, shape, canopy clean, and road/sidewalk clearance.\r\n\r\n2 Flowering Plums- remove. The two on west side. \r\n\r\nBarberries, Burning Bushes, 2 Bradford Pears, Lilacs, Arborvitae- front and front/side, shape, reduce suckers, clear away from house.\r\n\r\nMM N",
            "assignedUsers": {
              "nodes": [
                {
                  "id": "Z2lkOi8vSm9iYmVyL1VzZXIvMzY5NTE4",
                  "name": {
                    "full": "Anthony Morrow"
                  }
                },
                {
                  "id": "Z2lkOi8vSm9iYmVyL1VzZXIvMjAzMDkzMg==",
                  "name": {
                    "full": "Madeleine Hooker"
                  }
                },
                {
                  "id": "Z2lkOi8vSm9iYmVyL1VzZXIvMTgxMjY4OQ==",
                  "name": {
                    "full": "Omar Sierra"
                  }
                }
              ]
            },
            "client": {
              "id": "Z2lkOi8vSm9iYmVyL0NsaWVudC8xODg1MzIzOQ==",
              "name": "Claire Randel",
              "firstName": "Claire",
              "lastName": "Randel",
              "emails": [
                {
                  "address": "clairerandel2@gmail.com",
                  "primary": true
                }
              ],
              "phones": [
                {
                  "number": "509-720-4452",
                  "primary": true,
                  "smsAllowed": true
                }
              ],
              "companyName": null
            },
            "property": {
              "id": "Z2lkOi8vSm9iYmVyL1Byb3BlcnR5LzE5OTA5MzQ1",
              "address": {
                "street": "50 w 23rd",
                "city": "Spokane",
                "province": "WA",
                "postalCode": "99203",
                "coordinates": {
                  "latitudeString": "47.6337622",
                  "longitudeString": "-117.4132429"
                }
              }
            },
            "job": {
              "id": "Z2lkOi8vSm9iYmVyL0pvYi85MTUyNjEzMg==",
              "jobberWebUri": "https://secure.getjobber.com/work_orders/91526132",
              "jobNumber": 4445,
              "total": 2520,
              "salesperson": null,
              "customFields": [
                {
                  "__typename": "CustomFieldText",
                  "label": "Job Information",
                  "valueText": ""
                },
                {
                  "__typename": "CustomFieldText",
                  "label": "Misc",
                  "valueText": ""
                },
                {
                  "__typename": "CustomFieldText",
                  "label": "Bidder",
                  "valueText": "Mason"
                },
                {
                  "__typename": "CustomFieldText",
                  "label": "Referred By",
                  "valueText": ""
                }
              ]
            }
          }
        },
        {
          "node": {
            "id": "Z2lkOi8vSm9iYmVyL1Zpc2l0LzE0NjE1MzI0MTU=",
            "title": "=WolffJr -C- 612 W Sumner - 2C/2P/2G 1d",
            "visitStatus": "COMPLETED",
            "startAt": "2024-07-11T14:00:00Z",
            "endAt": "2024-07-11T15:00:00Z",
            "allDay": false,
            "instructions": "chip",
            "assignedUsers": {
              "nodes": [
                {
                  "id": "Z2lkOi8vSm9iYmVyL1VzZXIvNjAzMzI2",
                  "name": {
                    "full": "Zayren Bubb"
                  }
                },
                {
                  "id": "Z2lkOi8vSm9iYmVyL1VzZXIvOTExMjIy",
                  "name": {
                    "full": "Felix Gayton"
                  }
                }
              ]
            },
            "client": {
              "id": "Z2lkOi8vSm9iYmVyL0NsaWVudC8yOTY5MDc3Mg==",
              "name": "Fritz Wolff Jr",
              "firstName": "Fritz",
              "lastName": "Wolff Jr",
              "emails": [
                {
                  "address": "bradconom@gmail.com",
                  "primary": true
                }
              ],
              "phones": [
                {
                  "number": "509-844-1678 Brad Conom",
                  "primary": true,
                  "smsAllowed": true
                }
              ],
              "companyName": null
            },
            "property": {
              "id": "Z2lkOi8vSm9iYmVyL1Byb3BlcnR5LzMxOTk1OTIw",
              "address": {
                "street": "612 West Sumner Avenue",
                "city": "Spokane",
                "province": "Washington",
                "postalCode": "99204",
                "coordinates": {
                  "latitudeString": "47.646974",
                  "longitudeString": "-117.4204796"
                }
              }
            },
            "job": {
              "id": "Z2lkOi8vSm9iYmVyL0pvYi8zNzA3OTI5OQ==",
              "jobberWebUri": "https://secure.getjobber.com/work_orders/37079299",
              "jobNumber": 1675,
              "total": 7395,
              "salesperson": null,
              "customFields": [
                {
                  "__typename": "CustomFieldText",
                  "label": "Job Information",
                  "valueText": ""
                },
                {
                  "__typename": "CustomFieldText",
                  "label": "Misc",
                  "valueText": ""
                },
                {
                  "__typename": "CustomFieldText",
                  "label": "Bidder",
                  "valueText": "Kelly"
                },
                {
                  "__typename": "CustomFieldText",
                  "label": "Referred By",
                  "valueText": ""
                }
              ]
            }
          }
        },
        {
          "node": {
            "id": "Z2lkOi8vSm9iYmVyL1Zpc2l0LzE0NjAxNzEyNTA=",
            "title": "Scarpelli -CDA- 5075 S Seeweewanna Ct",
            "visitStatus": "COMPLETED",
            "startAt": "2024-07-11T15:00:00Z",
            "endAt": "2024-07-11T23:00:00Z",
            "allDay": false,
            "instructions": "there are 3 down, 2 dead standing\r\n5075 Seeweewanna  ct. But the trees are right off of Eddyville before you turn onto Seeweewanna. You'll see a red ski  with our name on it.",
            "assignedUsers": {
              "nodes": [
                {
                  "id": "Z2lkOi8vSm9iYmVyL1VzZXIvMzY4Mzkx",
                  "name": {
                    "full": "Kelly Chadwick"
                  }
                },
                {
                  "id": "Z2lkOi8vSm9iYmVyL1VzZXIvMTY4NjUxMg==",
                  "name": {
                    "full": "Floater"
                  }
                }
              ]
            },
            "client": {
              "id": "Z2lkOi8vSm9iYmVyL0NsaWVudC84NzYwODQ5Mw==",
              "name": "Michael Scarpelli",
              "firstName": "Michael",
              "lastName": "Scarpelli",
              "emails": [
                {
                  "address": "miscarpe20@gmail.com",
                  "primary": true
                }
              ],
              "phones": [
                {
                  "number": "509-435-3275",
                  "primary": true,
                  "smsAllowed": true
                }
              ],
              "companyName": null
            },
            "property": {
              "id": "Z2lkOi8vSm9iYmVyL1Byb3BlcnR5Lzk0NDMwNzQ2",
              "address": {
                "street": "5075 S Seeweewanna Ct",
                "city": "Harrison",
                "province": "Idaho",
                "postalCode": "83833",
                "coordinates": null
              }
            },
            "job": {
              "id": "Z2lkOi8vSm9iYmVyL0pvYi85MzUzMDMyMQ==",
              "jobberWebUri": "https://secure.getjobber.com/work_orders/93530321",
              "jobNumber": 4517,
              "total": 2800,
              "salesperson": null,
              "customFields": [
                {
                  "__typename": "CustomFieldText",
                  "label": "Job Information",
                  "valueText": ""
                },
                {
                  "__typename": "CustomFieldText",
                  "label": "Misc",
                  "valueText": "Fritz W"
                },
                {
                  "__typename": "CustomFieldText",
                  "label": "Bidder",
                  "valueText": "Kelly"
                },
                {
                  "__typename": "CustomFieldText",
                  "label": "Referred By",
                  "valueText": ""
                }
              ]
            }
          }
        },
        {
          "node": {
            "id": "Z2lkOi8vSm9iYmVyL1Zpc2l0LzE0NTE5NTg2MDE=",
            "title": "Ibach -NW- 2715 W Rowan - 1C*/1G 3h",
            "visitStatus": "COMPLETED",
            "startAt": "2024-07-11T17:00:00Z",
            "endAt": "2024-07-11T19:00:00Z",
            "allDay": false,
            "instructions": "🚒Omar+DT \r\n1C*/1G 3h (with both Felix and Zayren working this should take much less time)\r\n\r\nEuropean ash\r\nQuick pruning to remove deadwood and broken or damaged branches\r\n\r\nLow budget job - don’t spend more than three hours total\r\n\r\nBD",
            "assignedUsers": {
              "nodes": [
                {
                  "id": "Z2lkOi8vSm9iYmVyL1VzZXIvOTExMjIy",
                  "name": {
                    "full": "Felix Gayton"
                  }
                },
                {
                  "id": "Z2lkOi8vSm9iYmVyL1VzZXIvNjAzMzI2",
                  "name": {
                    "full": "Zayren Bubb"
                  }
                },
                {
                  "id": "Z2lkOi8vSm9iYmVyL1VzZXIvMTg5NjI2OA==",
                  "name": {
                    "full": "Peter Sherman"
                  }
                }
              ]
            },
            "client": {
              "id": "Z2lkOi8vSm9iYmVyL0NsaWVudC84NTMwNjUwOA==",
              "name": "Amanda Ibach",
              "firstName": "Amanda",
              "lastName": "Ibach",
              "emails": [
                {
                  "address": "aibach02@gmail.com",
                  "primary": true
                }
              ],
              "phones": [
                {
                  "number": "509-979-0302",
                  "primary": true,
                  "smsAllowed": true
                }
              ],
              "companyName": null
            },
            "property": {
              "id": "Z2lkOi8vSm9iYmVyL1Byb3BlcnR5LzkyMDIyODMw",
              "address": {
                "street": "2715 West Rowan Avenue",
                "city": "Spokane",
                "province": "Washington",
                "postalCode": "99205",
                "coordinates": {
                  "latitudeString": "47.7078907",
                  "longitudeString": "-117.4512717"
                }
              }
            },
            "job": {
              "id": "Z2lkOi8vSm9iYmVyL0pvYi85MjkwODQxNQ==",
              "jobberWebUri": "https://secure.getjobber.com/work_orders/92908415",
              "jobNumber": 4485,
              "total": 750,
              "salesperson": null,
              "customFields": [
                {
                  "__typename": "CustomFieldText",
                  "label": "Job Information",
                  "valueText": ""
                },
                {
                  "__typename": "CustomFieldText",
                  "label": "Misc",
                  "valueText": ""
                },
                {
                  "__typename": "CustomFieldText",
                  "label": "Bidder",
                  "valueText": "Ben"
                },
                {
                  "__typename": "CustomFieldText",
                  "label": "Referred By",
                  "valueText": ""
                }
              ]
            }
          }
        }
      ]
    }
  },
  "extensions": {
    "cost": {
      "requestedQueryCost": 9902,
      "actualQueryCost": 1735,
      "throttleStatus": {
        "maximumAvailable": 10000,
        "currentlyAvailable": 8265,
        "restoreRate": 500
      }
    },
    "versioning": {
      "version": "2025-01-20"
    }
  }
};
//////////////////////////////////////////
// This is the transformation of the raw data from the 
// API to the data that the component will use:
//////////////////////////////////////////
const transformVisitData = (visit: any): JobVisit => {
  const v = visit.node;
  const date = format(parseISO(v.startAt), 'yyyy-MM-dd');
  const shortDate = format(parseISO(v.startAt), 'M/d');
  const startTime = v.startAt ? v.startAt.split('T')[1] : undefined;
  const endTime = v.endAt ? v.endAt.split('T')[1] : undefined;
  const dayName = format(parseISO(v.startAt), 'EEEE');

  const returnVisitData = {
    id: v.id,
    jobNumber: v.job.jobNumber,
    title: v.title,
    date,
    dayName,
    shortDate,
    startTime, 
    endTime, 
    allDay: v.allDay,
    location: {
      street: v.property.address.street,
      city: v.property.address.city,
      province: v.property.address.province,
      postalCode: v.property.address.postalCode,
      coordinates: v.property.address.coordinates
    },
    instructions: v.instructions,
    webUri: v.job.jobberWebUri,
    client: {
      id: v.client.id,
      fullName: v.client.name,
      firstName: v.client.firstName,
      lastName: v.client.lastName,
      emails: v.client.emails,
      phones: v.client.phones,
      company: v.client.companyName
    },
    total: v.job.total,
    customFields: v.job.customFields,
    assignedMembers: mergeVisitAssignedMembersData(v, v.assignedUsers.nodes),
    salesperson: v.job.salesperson?.name?.first,
    confirmationStatus: "Unconfirmed" as JobVisitConfirmationStatus
  };

  return returnVisitData;
};

const mergeVisitAssignedMembersData = (visit: JobVisit, assignedMembers: any[]) : TeamMemberInstance[] => {
  // This is where we combine the data from Jobber with the data from our storage
  // for now we are just returning the assigned members
  return assignedMembers.map((member, index) => ({
    member: {
      id: member.id,
      firstName: member.name.full.split(' ')[0],
      lastName: member.name.full.split(' ')[1]
    },
    instanceId: undefined,
    highlightId: undefined,
    displayName: member.name.full.split(' ')[0]    
  }));
};

const mergeTeamMembersDataWithAvailabilityData = () => {
  // Ideally we'll have a list from the API of dates (matching our start/end dates for this ScheduleDocument), 
  // Each day in the list of dates will have a list of team members, with their availability for that day
  // For now, we are just returning all the team members with empty availability data
  return TeamMembersData.map((teamMember) => ({
    ...teamMember,
    available: true,
    availabilityEvents: [] // this is where we would put the availability events

    // 
    // availabilityEvents: [
    //   {
    //     id: "1",
    //     teamMember: teamMember.firstName +" "+ teamMember.lastName,
    //     eventType: "Personal Appointment",
    //     startDate: "2025-02-21T23:03:06.177Z",
    //     endDate: "2025-02-22T23:03:06.177Z",
    //     startTime: "07:00:00",
    //     endTime: "13:00:00",
    //     recurrence: "Every Month",
    //     monthlyRecurrence: {
    //       type: "Week & Day",
    //       monthlyWeek: "First",
    //       monthlyDayOfWeek: "Monday"
    //     }
    //   }
    // ]
  }));
}

const transformDateRangeData = (data: any): ScheduleDocument => {
  const jobQueue: JobVisit[] = [];
  const scheduleDays: ScheduleDay[] = [];

  // This is where we loop through the visits and create the jobQueue, scheduleDays, and teamMember availability
  data.data.visits.edges.forEach((visit: any) => {
    const date = format(parseISO(visit.node.startAt), 'yyyy-MM-dd');
    const dateName = format(parseISO(visit.node.startAt), 'EEEE');

    // Here's where we grab the visits on our user-selectable "Job Queue" day,
    // which defaults to Sunday, and put them in the Job Queue.
    if (dateName === APP_SETTINGS.jobQueueDay) {
      jobQueue.push(transformVisitData(visit));
    }

    let scheduleDay = scheduleDays.find(day => day.date === date);
    if (!scheduleDay) {
      const shortDate = format(parseISO(visit.node.startAt), 'M/d');
      
      /////////////////////////////////////////////////////////////
      // Fake AVAILABILITY data for the team members... 
      // Will need to get this from the Team Calendar API
      const TeamMembersWithAvailabilityData = mergeTeamMembersDataWithAvailabilityData();
      /////////////////////////////////////////////////////////////
      
      scheduleDay = {
        id: date,
        name: dateName,
        date: date,
        shortDate: shortDate,
        jobVisits: [],
        teamMembers: TeamMembersWithAvailabilityData
      };
      scheduleDays.push(scheduleDay);
    }
    scheduleDay.jobVisits?.push(transformVisitData(visit));
  });

  return {
    id: 'SP-001',
    title: 'Schedule Document',
    date_created: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
    date_modified: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
    dateRangeStart: data.data.visits.edges[0].node.startAt,
    dateRangeEnd: data.data.visits.edges[data.data.visits.edges.length - 1].node.startAt,
    scheduleDays: scheduleDays,
    jobQueue: jobQueue
  };
};

const scheduleDocumentData = transformDateRangeData(rawVisitsDATA);

export default scheduleDocumentData;
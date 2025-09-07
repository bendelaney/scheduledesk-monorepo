import { TeamMember } from "@/types";
import APP_SETTINGS from "./appSettings";
// GraphQL query used to fetch data
/*
query GetActiveUsers {
  users(filter:{status:ACTIVATED}, first:40){
    edges {
      node {
        id
        name {
          first
          last
          full
        }
        email {
          raw
        }
        phone {
          friendly
        }
      }
    }
  }
}
*/

// // Raw response from the Jobber API query above
const jobberData = {
  "data": {
    "users": {
      "edges": [
        {
          "node": {
            "id": "Z2lkOi8vSm9iYmVyL1VzZXIvMzY4Mzkz",
            "name": {
              "first": "Ben",
              "last": "Delaney",
              "full": "Ben Delaney"
            },
            "email": {
              "raw": "ben@spiritpruners.com"
            },
            "phone": {
              "friendly": "(509) 879-3344"
            }
          }
        },
        {
          "node": {
            "id": "Z2lkOi8vSm9iYmVyL1VzZXIvNTM2MDYx",
            "name": {
              "first": "Dario",
              "last": "Ré",
              "full": "Dario Ré"
            },
            "email": {
              "raw": "dariore555@gmail.com"
            },
            "phone": {
              "friendly": "(509) 655-2044"
            }
          }
        },
        {
          "node": {
            "id": "Z2lkOi8vSm9iYmVyL1VzZXIvMzY5NTE2",
            "name": {
              "first": "Isaiah",
              "last": "Crandall",
              "full": "Isaiah Crandall"
            },
            "email": {
              "raw": "isaiahcrandall@rocketmail.com"
            },
            "phone": {
              "friendly": "(509) 413-9809"
            }
          }
        },
        {
          "node": {
            "id": "Z2lkOi8vSm9iYmVyL1VzZXIvMjcwNjk2Mw==",
            "name": {
              "first": "Jay",
              "last": "Gear",
              "full": "Jay Gear"
            },
            "email": {
              "raw": "gearejulie@gmail.com"
            },
            "phone": {
              "friendly": "(510) 501-4911"
            }
          }
        },
        {
          "node": {
            "id": "Z2lkOi8vSm9iYmVyL1VzZXIvMzY4Mzkx",
            "name": {
              "first": "Kelly",
              "last": "Chadwick",
              "full": "Kelly Chadwick"
            },
            "email": {
              "raw": "k@spiritpruners.com"
            },
            "phone": {
              "friendly": "(***) ***-3062"
            }
          }
        },
        {
          "node": {
            "id": "Z2lkOi8vSm9iYmVyL1VzZXIvMTM2MDE3OA==",
            "name": {
              "first": "Sara",
              "last": "Callan Boggs",
              "full": "Sara Callan Boggs"
            },
            "email": {
              "raw": "admin@spiritpruners.com"
            },
            "phone": {
              "friendly": "(509) 808-6978"
            }
          }
        },
        {
          "node": {
            "id": "Z2lkOi8vSm9iYmVyL1VzZXIvMzY5NTE4",
            "name": {
              "first": "Anthony",
              "last": "Morrow",
              "full": "Anthony Morrow"
            },
            "email": {
              "raw": "anthonymorrow044@gmail.com"
            },
            "phone": {
              "friendly": "(509) 768-6971"
            }
          }
        },
        {
          "node": {
            "id": "Z2lkOi8vSm9iYmVyL1VzZXIvMzE4OTM2Mw==",
            "name": {
              "first": "Carson",
              "last": "Salter",
              "full": "Carson Salter"
            },
            "email": {
              "raw": "carson.salter.9@gmail.com"
            },
            "phone": {
              "friendly": "(817) 995-9395"
            }
          }
        },
        {
          "node": {
            "id": "Z2lkOi8vSm9iYmVyL1VzZXIvMjgyMTI3Mw==",
            "name": {
              "first": "Coty",
              "last": "Newby",
              "full": "Coty Newby"
            },
            "email": {
              "raw": "coty.rugby@gmail.com"
            },
            "phone": {
              "friendly": "(720) 375-5079"
            }
          }
        },
        {
          "node": {
            "id": "Z2lkOi8vSm9iYmVyL1VzZXIvMzM0NzMyNw==",
            "name": {
              "first": "Daymond",
              "last": "Nearpass",
              "full": "Daymond Nearpass"
            },
            "email": {
              "raw": "daymondnearpass1@gmail.com"
            },
            "phone": {
              "friendly": "(509) 541-4292"
            }
          }
        },
        {
          "node": {
            "id": "Z2lkOi8vSm9iYmVyL1VzZXIvOTExMjIy",
            "name": {
              "first": "Felix",
              "last": "Gayton",
              "full": "Felix Gayton"
            },
            "email": {
              "raw": "felix_gayton@yahoo.com"
            },
            "phone": {
              "friendly": "(208) 818-8180"
            }
          }
        },
        {
          "node": {
            "id": "Z2lkOi8vSm9iYmVyL1VzZXIvMTY4NjUxMg==",
            "name": {
              "first": "Floater",
              "last": "",
              "full": "Floater"
            },
            "email": {
              "raw": "Admin+floater@spiritpruners.com"
            },
            "phone": {
              "friendly": ""
            }
          }
        },
        {
          "node": {
            "id": "Z2lkOi8vSm9iYmVyL1VzZXIvMzY5NTA5",
            "name": {
              "first": "Jose",
              "last": "Villa",
              "full": "Jose Villa"
            },
            "email": {
              "raw": "paint.much@yahoo.com"
            },
            "phone": {
              "friendly": "(509) 216-5507"
            }
          }
        },
        {
          "node": {
            "id": "Z2lkOi8vSm9iYmVyL1VzZXIvMzMxMzczOA==",
            "name": {
              "first": "Justin",
              "last": "Howe",
              "full": "Justin Howe"
            },
            "email": {
              "raw": "howejustin1999@gmail.com"
            },
            "phone": {
              "friendly": "(208) 204-8377"
            }
          }
        },
        {
          "node": {
            "id": "Z2lkOi8vSm9iYmVyL1VzZXIvNDU0NzYw",
            "name": {
              "first": "Krystn",
              "last": "Parmley",
              "full": "Krystn Parmley"
            },
            "email": {
              "raw": "parmleyk@hotmail.com"
            },
            "phone": {
              "friendly": "(509) 385-8711"
            }
          }
        },
        {
          "node": {
            "id": "Z2lkOi8vSm9iYmVyL1VzZXIvMTg5NjI2OA==",
            "name": {
              "first": "Peter",
              "last": "Sherman",
              "full": "Peter Sherman"
            },
            "email": {
              "raw": "peter.w.sherman88@gmail.com"
            },
            "phone": {
              "friendly": "(360) 298-0865"
            }
          }
        },
        {
          "node": {
            "id": "Z2lkOi8vSm9iYmVyL1VzZXIvODYwMTE1",
            "name": {
              "first": "Phil",
              "last": "Pintor",
              "full": "Phil Pintor"
            },
            "email": {
              "raw": "philpintorjr@gmail.com"
            },
            "phone": {
              "friendly": "(509) 981-3911"
            }
          }
        },
        {
          "node": {
            "id": "Z2lkOi8vSm9iYmVyL1VzZXIvMTQ4Njg3MA==",
            "name": {
              "first": "Pura",
              "last": "Vida 1",
              "full": "Pura Vida 1"
            },
            "email": {
              "raw": "admin+puravida1@spiritpruners.com"
            },
            "phone": {
              "friendly": ""
            }
          }
        },
        {
          "node": {
            "id": "Z2lkOi8vSm9iYmVyL1VzZXIvMTQ4Njg3MQ==",
            "name": {
              "first": "Pura",
              "last": "Vida 2",
              "full": "Pura Vida 2"
            },
            "email": {
              "raw": "admin+puravida2@spiritpruners.com"
            },
            "phone": {
              "friendly": ""
            }
          }
        },
        {
          "node": {
            "id": "Z2lkOi8vSm9iYmVyL1VzZXIvMjA0MjI2MA==",
            "name": {
              "first": "Pura",
              "last": "Vida 3",
              "full": "Pura Vida 3"
            },
            "email": {
              "raw": "admin+puravida3@spiritpruners.com"
            },
            "phone": {
              "friendly": ""
            }
          }
        },
        {
          "node": {
            "id": "Z2lkOi8vSm9iYmVyL1VzZXIvNDc1NDUx",
            "name": {
              "first": "Tal",
              "last": "Weisenburger",
              "full": "Tal Weisenburger"
            },
            "email": {
              "raw": "talwisen@yahoo.com"
            },
            "phone": {
              "friendly": "(509) 688-5110"
            }
          }
        },
        {
          "node": {
            "id": "Z2lkOi8vSm9iYmVyL1VzZXIvMzY5NTEx",
            "name": {
              "first": "Wakan",
              "last": "Burrows",
              "full": "Wakan Burrows"
            },
            "email": {
              "raw": "wakanlovestrees@gmail.com"
            },
            "phone": {
              "friendly": "(509) 499-6941"
            }
          }
        },
        {
          "node": {
            "id": "Z2lkOi8vSm9iYmVyL1VzZXIvNjAzMzI2",
            "name": {
              "first": "Zayren",
              "last": "Bubb",
              "full": "Zayren Bubb"
            },
            "email": {
              "raw": "bubbzayren24@gmail.com"
            },
            "phone": {
              "friendly": "(509) 991-1470"
            }
          }
        }
      ]
    }
  },
  "extensions": {
    "cost": {
      "requestedQueryCost": 402,
      "actualQueryCost": 232,
      "throttleStatus": {
        "maximumAvailable": 10000,
        "currentlyAvailable": 9768,
        "restoreRate": 500
      }
    },
    "versioning": {
      "version": "2025-01-20"
    }
  }
};


// We will need to do this in a more dynamic way, but for now, this is fine
// This is a mock of the non-Jobber data that we will merge with the Jobber data
let nonJobberData = [
  {
    "jobberId": "Z2lkOi8vSm9iYmVyL1VzZXIvMzY4Mzkz",
    "name": {
      "first": "Ben",
      "last": "Delaney",
      "full": "Ben Delaney"
    },
    "avatarUri": "/data/teamMemberAvatars/ben.png",
    "defaultHighlightId": "1"
  },
  {
    "jobberId": "Z2lkOi8vSm9iYmVyL1VzZXIvMzY5NTE2",
    "name": {
      "first": "Isaiah",
      "last": "Crandall",
      "full": "Isaiah Crandall"
    },
    "avatarUri": "/data/teamMemberAvatars/isaiah.png",
    "highlightId": "3"
  },
  {
    "jobberId": "Z2lkOi8vSm9iYmVyL1VzZXIvMzY4Mzkx",
    "name": {
      "first": "Kelly",
      "last": "Chadwick",
      "full": "Kelly Chadwick"
    },
    "avatarUri": "/data/teamMemberAvatars/kelly.png",
    "highlightId": "3"
  },
  {
    "jobberId": "Z2lkOi8vSm9iYmVyL1VzZXIvNDU0NzYw",
    "name": {
      "first": "Krystn",
      "last": "Parmley",
      "full": "Krystn Parmley"
    },
    "avatarUri": "/data/teamMemberAvatars/krystn.png",
    "highlightId": "3"
  },
  {
    "jobberId": "Z2lkOi8vSm9iYmVyL1VzZXIvMTM2MDE3OA==",
    "name": {
      "first": "Sara",
      "last": "Callan Boggs",
      "full": "Sara Callan Boggs"
    },
    "avatarUri": "/data/teamMemberAvatars/sara.png",
    "highlightId": ""
  },
  {
    "jobberId": "Z2lkOi8vSm9iYmVyL1VzZXIvNTI0NTc3",
    "name": {
      "first": "Amoe",
      "last": "Moe",
      "full": "Alex Moe"
    },
    "avatarUri": "/data/teamMemberAvatars/amoe.png",
    "highlightId": "1"
  },
  {
    "jobberId": "Z2lkOi8vSm9iYmVyL1VzZXIvMzY5NTE4",
    "name": {
      "first": "Anthony",
      "last": "Morrow",
      "full": "Anthony Morrow"
    },
    "avatarUri": "/data/teamMemberAvatars/anthony.png",
    "highlightId": "3"
  },
  {
    "jobberId": "Z2lkOi8vSm9iYmVyL1VzZXIvNTM2MDYx",
    "name": {
      "first": "Dario",
      "last": "Ré",
      "full": "Dario Ré"
    },
    "avatarUri": "/data/teamMemberAvatars/dario.png",
    "highlightId": "3"
  },
  {
    "jobberId": "Z2lkOi8vSm9iYmVyL1VzZXIvOTExMjIy",
    "name": {
      "first": "Felix",
      "last": "Gayton",
      "full": "Felix Gayton"
    },
    "avatarUri": "/data/teamMemberAvatars/felix.png",
    "highlightId": "2"
  },
  {
    "jobberId": "Z2lkOi8vSm9iYmVyL1VzZXIvMTY4NjUxMg==",
    "name": {
      "first": "Floater",
      "last": "",
      "full": "Floater"
    },
    "avatarUri": "",
    "highlightId": "99"
  },
  {
    "jobberId": "Z2lkOi8vSm9iYmVyL1VzZXIvMzY5NTA5",
    "name": {
      "first": "Jose",
      "last": "Villa",
      "full": "Jose Villa"
    },
    "avatarUri": "/data/teamMemberAvatars/jose.png",
    "highlightId": "1"
  },
  {
    "jobberId": "Z2lkOi8vSm9iYmVyL1VzZXIvMjAzMDkzMg==",
    "name": {
      "first": "Madeleine",
      "last": "Hooker",
      "full": "Madeleine Hooker"
    },
    "avatarUri": "/data/teamMemberAvatars/madeleine.png",
    "highlightId": "3"
  },
  {
    "jobberId": "Z2lkOi8vSm9iYmVyL1VzZXIvMTQ0MDA0MA==",
    "name": {
      "first": "Mason",
      "last": "McBride",
      "full": "Mason McBride"
    },
    "avatarUri": "/data/teamMemberAvatars/mason.png",
    "highlightId": ""
  },
  {
    "jobberId": "Z2lkOi8vSm9iYmVyL1VzZXIvMTgxMjY4OQ==",
    "name": {
      "first": "Omar",
      "last": "Sierra",
      "full": "Omar Sierra"
    },
    "avatarUri": "/data/teamMemberAvatars/omar.png",
    "highlightId": "3"
  },
  {
    "jobberId": "Z2lkOi8vSm9iYmVyL1VzZXIvMTg5NjI2OA==",
    "name": {
      "first": "Peter",
      "last": "Sherman",
      "full": "Peter Sherman"
    },
    "avatarUri": "/data/teamMemberAvatars/peter.png",
    "highlightId": "3"
  },
  {
    "jobberId": "Z2lkOi8vSm9iYmVyL1VzZXIvMTQ4Njg3MA==",
    "name": {
      "first": "PV1",
      "last": "Vida 1",
      "full": "Pura Vida 1"
    },
    "avatarUri": "",
    "highlightId": "5"
  },
  {
    "jobberId": "Z2lkOi8vSm9iYmVyL1VzZXIvMTQ4Njg3MQ==",
    "name": {
      "first": "PV2",
      "last": "Vida 2",
      "full": "Pura Vida 2"
    },
    "avatarUri": "",
    "highlightId": "5"
  },
  {
    "jobberId": "Z2lkOi8vSm9iYmVyL1VzZXIvMjA0MjI2MA==",
    "name": {
      "first": "PV3",
      "last": "Vida 3",
      "full": "Pura Vida 3"
    },
    "avatarUri": "",
    "highlightId": "5"
  },
  {
    "jobberId": "Z2lkOi8vSm9iYmVyL1VzZXIvNDc1NDUx",
    "name": {
      "first": "Tal",
      "last": "Weisenburger",
      "full": "Tal Weisenburger"
    },
    "avatarUri": "/data/teamMemberAvatars/tal.png",
    "highlightId": "2"
  },
  {
    "jobberId": "Z2lkOi8vSm9iYmVyL1VzZXIvMzY5NTEx",
    "name": {
      "first": "Wakan",
      "last": "Burrows",
      "full": "Wakan Burrows"
    },
    "avatarUri": "",
    "highlightId": "1"
  },
  {
    "jobberId": "Z2lkOi8vSm9iYmVyL1VzZXIvNjAzMzI2",
    "name": {
      "first": "Zayren",
      "last": "Bubb",
      "full": "Zayren Bubb"
    },
    "avatarUri": "/data/teamMemberAvatars/zayren.png",
    "highlightId": "2"
  }
];

// Exclude Team Members, based on user-defined settings: 
const excludeList = APP_SETTINGS.excludedTeamMembers;

const convertAndMergeData = (jobberData: any, nonJobberData: any): TeamMember[] => {
  return jobberData.data.users.edges
    .filter((edge: any) => !excludeList.find((m: any) => m.id === edge.node.id))
    .map((edge: any) => {
      const { id, name, email, phone } = edge.node;
      const nonJobber = nonJobberData.find((nj: any) => nj.jobberId === id);
      return {
        id: id,
        firstName: nonJobber?.name?.first || name.first,
        lastName: nonJobber?.name?.last || name.last,
        email: email.raw,
        phone: phone.friendly,
        ...nonJobber
      };
    })
    // .sort((a: any, b: any) => (a.highlightId > b.highlightId) ? 1 : -1);
    .sort((a: any, b: any) => (a.firstName > b.firstName) ? 1 : -1);
};
const TeamMembersData: TeamMember[] = convertAndMergeData(jobberData, nonJobberData);

export default TeamMembersData;
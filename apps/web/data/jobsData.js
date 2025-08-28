// TODO: standardize the dates data. Should be in the format that the data comes from Jobber.
const JobsData = [
  {
    id: "J0",
    title: "Walker -S- 3516 E 64th Ct - 2C/1G 1d",
    jobNumber: "1234",
    date: "3/5/2024",
    startTime: "07:30:00",
    endTime: "16:30:00",
    total: 865,
    location: {
      mapWebUri: "https://secure.getjobber.com/absdcdeoiejfhttps://www.google.com/maps/place/3516+E+64th+Ct+Spokane+Washington+99999",
      street: "3516 E 64th Ct",
      city: "Spokane",
      province: "Washington",
      postalCode: "99999",
      coordinates: {
        latitudeString: "47.59546330000001",
        longitudeString: "-117.3583964"
      }
    },
    webUri: "https://secure.getjobber.com/absdcdeoiejf",
    jobInfo: "",
    bidder: "Ben",
    geoCode: "S",
    workCode: "2C/1G 1d",
    highlightId: "4",
    confirmationStatus: "Unconfirmed",
    client: {
      id: "X",
      fullName: "Walker",
      firstName: "",
      lastName: "Walker",
      email: "", 
      phone: "",
      company: "",
    }
  },
  {
    id: "J1",
    title: "Reese -S- 2504 S Manito Blvd - 1C/1G 4h",
    jobNumber: "2234",
    date: "3/6/2024",
    startTime: "08:00:00",
    endTime: "16:30:00",
    bidder: "Kelly",
    location: {
      mapWebUri: "https://secure.getjobber.com/absdcdeoiejfhttps://www.google.com/maps/place/2504+S+Manito+Blvd+Spokane+Washington+99999",
      street: "2504 S Manito Blvd",
      city: "Spokane",
      province: "Washington",
      postalCode: "99999",
      coordinates: {
        latitudeString: "47.6454907",
        longitudeString: "-117.4214552"
      }
    },
    webUri: "https://secure.getjobber.com/absdcdeoiejf",
    jobInfo: "",
    total: 750,
    geoCode: "S",
    workCode: "1C/1G 4h",
    highlightId: "5",
    confirmationStatus: "Unconfirmed",
    client: {
      id: "X",
      fullName: "Reese",
      firstName: "",
      lastName: "Reese",
      email: "", 
      phone: "",
      company: "",
    }
  },
  {
    id: "J2",
    title: "Hatchel -SE- 4101 S Havana - 2P 3h",
    jobNumber: "3234",
    date: "3/7/2024",
    startTime: "08:30:00",
    endTime: "12:30:00",
    bidder: "Kelly",
    location: {
      mapWebUri: "https://secure.getjobber.com/absdcdeoiejfhttps://www.google.com/maps/place/4101+S+Havana+Spokane+Washington+99999",
      street: "4101 S Havana",
      city: "Spokane",
      province: "Washington",
      postalCode: "99999",
      coordinates: {
        latitudeString: "47.6454907",
        longitudeString: "-117.4214552"
      }
    },
    webUri: "https://secure.getjobber.com/absdcdeoiejf",
    jobInfo: "",
    total: 600,
    geoCode: "SE",
    workCode: "2P 3h",
    highlightId: "5",
    confirmationStatus: "Unconfirmed",
    client: {
      id: "X",
      fullName: "Hatchel",
      firstName: "",
      lastName: "Hatchel",
      email: "", 
      phone: "",
      company: "",
    }
  },
  {
    id: "J3",
    title: "Sierra -S- 4011 E 33rd - 3C/1G 1d",
    jobNumber: "4234",
    date: "3/8/2024",
    startTime: "09:00:00",
    endTime: "17:00:00",
    bidder: "Isaiah",
    location: {
      mapWebUri: "https://secure.getjobber.com/absdcdeoiejfhttps://www.google.com/maps/place/4011+E+33rd+Spokane+Washington+99999",
      street: "4011 E 33rd",
      city: "Spokane",
      province: "Washington",
      postalCode: "99999",
      coordinates: {
        latitudeString: "47.6454907",
        longitudeString: "-117.4214552"
      }
    },
    webUri: "https://secure.getjobber.com/absdcdeoiejf",
    jobInfo: "",
    total: 3465,
    geoCode: "S",
    workCode: "3C/1G 1d",
    highlightId: "3",
    confirmationStatus: "Unconfirmed",
    client: {
      id: "X",
      fullName: "Sierra",
      firstName: "",
      lastName: "Sierra",
      email: "", 
      phone: "",
      company: "",
    }
  },
  {
    id: "J4",
    title: "Janzen -SC- 815 E Rockwood - 1C/1G 6h",
    jobNumber: "5234",
    date: "3/9/2024",
    startTime: "09:30:00",
    endTime: "17:30:00",
    bidder: "Ben",
    location: {
      mapWebUri: "https://secure.getjobber.com/absdcdeoiejfhttps://www.google.com/maps/place/815+E+Rockwood+Spokane+Washington+99999",
      street: "815 E Rockwood",
      city: "Spokane",
      province: "Washington",
      postalCode: "99999",
      coordinates: {
        latitudeString: "47.6454907",
        longitudeString: "-117.4214552"
      }
    },
    webUri: "https://secure.getjobber.com/absdcdeoiejf",
    jobInfo: "",
    total: 1350,
    geoCode: "SC",
    workCode: "1C/1G 6h",
    highlightId: "4",
    confirmationStatus: "Unconfirmed",
    client: {
      id: "X",
      fullName: "Janzen",
      firstName: "",
      lastName: "Janzen",
      email: "", 
      phone: "",
      company: "",
    }
  },
  {
    id: "J5",
    title: "Sweatt -C- 617 N Ash - 2P 4h",
    jobNumber: "6234",
    date: "3/9/2024",
    startTime: "08:00:00",
    endTime: "16:00:00",
    bidder: "Mason",
    location: {
      mapWebUri: "https://secure.getjobber.com/absdcdeoiejfhttps://www.google.com/maps/place/617+N+Ash+Spokane+Washington+99999",
      street: "617 N Ash",
      city: "Spokane",
      province: "Washington",
      postalCode: "99999",
      coordinates: {
        latitudeString: "47.6454907",
        longitudeString: "-117.4214552"
      }
    },
    webUri: "https://secure.getjobber.com/absdcdeoiejf",
    jobInfo: "",
    total: 870,
    geoCode: "C",
    workCode: "2P 4h",
    highlightId: "5",
    confirmationStatus: "Unconfirmed",
    client: {
      id: "X",
      fullName: "Sweatt",
      firstName: "",
      lastName: "Sweatt",
      email: "", 
      phone: "",
      company: "",
    }
  },
  {
    id: "J6",
    title: "Pfeifer -C- 317 E Joseph - 1P 4h",
    jobNumber: "7234",
    date: "3/10/2024",
    startTime: "08:00:00",
    endTime: "16:00:00",
    bidder: "Krystn",
    location: {
      mapWebUri: "https://secure.getjobber.com/absdcdeoiejfhttps://www.google.com/maps/place/317+E+Joseph+Spokane+Washington+99999",
      street: "317 E Joseph",
      city: "Spokane",
      province: "Washington",
      postalCode: "99999",
      coordinates: {
        latitudeString: "47.6454907",
        longitudeString: "-117.4214552"
      }
    },
    webUri: "https://secure.getjobber.com/absdcdeoiejf",
    jobInfo: "",
    total: 440,
    geoCode: "C",
    workCode: "1P 4h",
    highlightId: "6",
    confirmationStatus: "Unconfirmed",
    client: {
      id: "X",
      fullName: "Pfeifer",
      firstName: "",
      lastName: "Pfeifer",
      email: "", 
      phone: "",
      company: "",
    }
  },
  {
    id: "J7",
    title: "Montgomery -FN- 16726 E Temple - 2P 5h",
    jobNumber: "8234",
    date: "3/11/2024",
    startTime: "08:00:00",
    endTime: "16:00:00",
    bidder: "Isaiah",
    location: {
      mapWebUri: "https://secure.getjobber.com/absdcdeoiejfhttps://www.google.com/maps/place/16726+E+Temple+Spokane+Washington+99999",
      street: "16726 E Temple",
      city: "Spokane",
      province: "Washington",
      postalCode: "99999",
      coordinates: {
        latitudeString: "47.6454907",
        longitudeString: "-117.4214552"
      }
    },
    webUri: "https://secure.getjobber.com/absdcdeoiejf",
    jobInfo: "",
    total: 1110,
    geoCode: "FN",
    workCode: "2P 5h",
    highlightId: "5",
    confirmationStatus: "Unconfirmed",
    client: {
      id: "X",
      fullName: "Montgomery",
      firstName: "",
      lastName: "Montgomery",
      email: "", 
      phone: "",
      company: "",
    }
  },
  {
    id: "J8",
    title: "Willis -N- 816 W Avon Ave - 3P 7h",
    jobNumber: "9234",
    date: "3/12/2024",
    startTime: "08:00:00",
    endTime: "16:00:00",
    bidder: "Mason",
    location: {
      mapWebUri: "https://secure.getjobber.com/absdcdeoiejfhttps://www.google.com/maps/place/816+W+Avon+Ave+Spokane+Washington+99999",
      street: "816 W Avon Ave",
      city: "Spokane",
      province: "Washington",
      postalCode: "99999",
      coordinates: {
        latitudeString: "47.6454907",
        longitudeString: "-117.4214552"
      }
    },
    webUri: "https://secure.getjobber.com/absdcdeoiejf",
    jobInfo: "",
    total: 2680,
    geoCode: "N",
    workCode: "3P 7h",
    highlightId: "3",
    confirmationStatus: "Unconfirmed",
    client: {
      id: "X",
      fullName: "Willis",
      firstName: "",
      lastName: "Willis",
      email: "", 
      phone: "",
      company: "",
    }
  },
  {
    id: "J9",
    title: "Prish -N- 4423 N Stevens - 1P 4h",
    jobNumber: "12340",
    date: "3/13/2024",
    startTime: "08:00:00",
    endTime: "16:00:00",
    bidder: "Ben",
    location: {
      mapWebUri: "https://secure.getjobber.com/absdcdeoiejfhttps://www.google.com/maps/place/4423+N+Stevens+Spokane+Washington+99999",
      street: "4423 N Stevens",
      city: "Spokane",
      province: "Washington",
      postalCode: "99999",
      coordinates: {
        latitudeString: "47.6454907",
        longitudeString: "-117.4214552"
      }
    },
    webUri: "https://secure.getjobber.com/absdcdeoiejf",
    jobInfo: "",
    total: 395,
    geoCode: "N",
    workCode: "1P 4h",
    highlightId: "6",
    confirmationStatus: "Unconfirmed",
    client: {
      id: "X",
      fullName: "Prish",
      firstName: "",
      lastName: "Prish",
      email: "", 
      phone: "",
      company: "",
    }
  },
  {
    id: "J10",
    title: "PGD -N- 1808 W Spofford - 1C/2P/2G 1d",
    jobNumber: "12341",
    date: "3/14/2024",
    startTime: "08:00:00",
    endTime: "16:00:00",
    bidder: "Kelly",
    location: {
      mapWebUri: "https://secure.getjobber.com/absdcdeoiejfhttps://www.google.com/maps/place/1808+W+Spofford+Spokane+Washington+99999",
      street: "1808 W Spofford",
      city: "Spokane",
      province: "Washington",
      postalCode: "99999",
      coordinates: {
        latitudeString: "47.6454907",
        longitudeString: "-117.4214552"
      }
    },
    webUri: "https://secure.getjobber.com/absdcdeoiejf",
    jobInfo: "",
    total: 325,
    geoCode: "N",
    workCode: "1C/2P/2G 1d",
    highlightId: "2",
    confirmationStatus: "Unconfirmed",
    client: {
      id: "X",
      fullName: "PGD",
      firstName: "",
      lastName: "PGD",
      email: "", 
      phone: "",
      company: "",
    }
  },
  {
    id: "J11",
    title: "Henderson -NF- 31711 N Schwachtgen - 3P/1G 1d",
    jobNumber: "12342",
    date: "3/15/2024",
    startTime: "08:00:00",
    endTime: "16:00:00",
    bidder: "Mason",
    location: {
      mapWebUri: "https://secure.getjobber.com/absdcdeoiejfhttps://www.google.com/maps/place/31711+N+Schwachtgen+Spokane+Washington+99999",
      street: "31711 N Schwachtgen",
      city: "Spokane",
      province: "Washington",
      postalCode: "99999",
      coordinates: {
        latitudeString: "47.6454907",
        longitudeString: "-117.4214552"
      }
    },
    webUri: "https://secure.getjobber.com/absdcdeoiejf",
    jobInfo: "",
    total: 3225,
    geoCode: "NF",
    workCode: "3P/1G 1d",
    highlightId: "3",
    confirmationStatus: "Unconfirmed",
    client: {
      id: "X",
      fullName: "Henderson",
      firstName: "",
      lastName: "Henderson",
      email: "", 
      phone: "",
      company: "",
    }
  },
  {
    id: "J12",
    title: "Roberts -N- 718 W Mountainview Ln - 1C/1G 1d",
    jobNumber: "12343",
    date: "3/16/2024",
    startTime: "08:00:00",
    endTime: "16:00:00",
    bidder: "Kelly",
    location: {
      mapWebUri: "https://secure.getjobber.com/absdcdeoiejfhttps://www.google.com/maps/place/718+W+Mountainview+Ln+Spokane+Washington+99999",
      street: "718 W Mountainview Ln",
      city: "Spokane",
      province: "Washington",
      postalCode: "99999",
      coordinates: {
        latitudeString: "47.6454907",
        longitudeString: "-117.4214552"
      }
    },
    webUri: "https://secure.getjobber.com/absdcdeoiejf",
    jobInfo: "",
    total: 1760,
    geoCode: "N",
    workCode: "1C/1G 1d",
    highlightId: "4",
    confirmationStatus: "Unconfirmed",
    client: {
      id: "X",
      fullName: "Roberts",
      firstName: "",
      lastName: "Roberts",
      email: "", 
      phone: "",
      company: "",
    }
  },
  {
    id: "J13",
    title: "Baker -N- 1819 W Walton - 2P 4h",
    jobNumber: "12344",
    date: "3/17/2024",
    startTime: "08:00:00",
    endTime: "16:00:00",
    bidder: "Krystn",
    location: {
      mapWebUri: "https://secure.getjobber.com/absdcdeoiejfhttps://www.google.com/maps/place/1819+W+Walton+Spokane+Washington+99999",
      street: "1819 W Walton",
      city: "Spokane",
      province: "Washington",
      postalCode: "99999",
      coordinates: {
        latitudeString: "47.6454907",
        longitudeString: "-117.4214552"
      }
    },
    webUri: "https://secure.getjobber.com/absdcdeoiejf",
    jobInfo: "",
    total: 340,
    geoCode: "N",
    workCode: "2P 4h",
    highlightId: "6",
    confirmationStatus: "Unconfirmed",
    client: {
      id: "X",
      fullName: "Baker",
      firstName: "",
      lastName: "Baker",
      email: "", 
      phone: "",
      company: "",
    }
  },
];

export default JobsData;

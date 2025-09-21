import { formatDate, formatTime } from './date'

// Extract unique salespeople from data
export function extractSalespeople(data: any): string[] {
  const salespeople = new Set<string>();
  if (data?.data?.visits?.edges) {
    data.data.visits.edges.forEach((edge: any) => {
      if (edge.node.job.salesperson && edge.node.job.salesperson.name.first) {
        salespeople.add(edge.node.job.salesperson.name.first.trim());
      }
    });
  }
  return Array.from(salespeople).sort();
}

// Function to format the Jobber visits JSON into Markdown or plaintext
export function formatJobList(
  data: any,
  settings: any,
  startDate: Date | null,
  endDate: Date | null,
  formatType: 'markdown' | 'plaintext' = 'markdown',
  filterText: string = ''
): string {

  let output = '';
  let total = 0;
  let jobCount = 0;
  let jobLines = '';

  // Strict filter: if "Include Selected" is chosen but no salespeople are selected, show nothing
  if (settings?.salespersonFilter === 'showSelected') {
    const selected = settings.selectedSalespeople || [];
    if (selected.length === 0) {
      return '';
    }
  }

  // Handle all cases: no data, no visits structure, or empty visits
  const visits = data?.data?.visits?.edges ? data.data.visits.edges : []

  // if (visits.length === 0) {
  //   return output;
  // } else {
    // Sort visits based on geo code extracted from the title
    const getGeoCode = (edge: any): string => {
      const titleParts = edge.node.title.match(/(^[^-]+)|(-[A-Z]+-)|([^-\s][^-\n]*[^-\s])|(-[^-\s][^-\n]*[^-\s])/g);
      return (titleParts && titleParts[1]) ? titleParts[1].trim() : '';
    };

    // Sort based on settings
    switch (settings.sortBy) {
      case "geoCode":
        visits.sort((a: any, b: any) => getGeoCode(a).localeCompare(getGeoCode(b)));
        break;
      case "value":
        visits.sort((a: any, b: any) => {
          const valueA = a.node.job.total || 0;
          const valueB = b.node.job.total || 0;
          return valueB - valueA;
        });
        break;
      case "geoCodeThenValue":
        visits.sort((a: any, b: any) => {
          const geoCodeA = getGeoCode(a);
          const geoCodeB = getGeoCode(b);
          const valueA = a.node.job.total || 0;
          const valueB = b.node.job.total || 0;

          const geoCodeComparison = geoCodeA.localeCompare(geoCodeB);
          if (geoCodeComparison !== 0) {
            return geoCodeComparison;
          } else {
            return valueB - valueA;
          }
        });
        break;
      case "alphabetical":
        visits.sort((a: any, b: any) => a.node.title.localeCompare(b.node.title));
        break;
      case "salesperson":
        visits.sort((a: any, b: any) => {
          const salespersonA = a.node.job.salesperson ? a.node.job.salesperson.name.first : '';
          const salespersonB = b.node.job.salesperson ? b.node.job.salesperson.name.first : '';
          return salespersonA.localeCompare(salespersonB);
        });
        break;
      case "date":
      default:
        visits.sort((a: any, b: any) => new Date(a.node.startAt).getTime() - new Date(b.node.startAt).getTime());
        break;
    }

    // Iterate over the visits and format them
    visits.forEach((edge:any) => {
      const titleParts = edge.node.title.match(/(^[^-]+)|(-[A-Z]+-)|([^-\s][^-\n]*[^-\s])|(-[^-\s][^-\n]*[^-\s])/g);
      let salespersonName = edge.node.job.salesperson ? edge.node.job.salesperson.name.first.trim() : 'Unknown';
      let includingLine = true;

      /*
      TODO:
      this is where we will need to get values in a more robust way,
      instead of just relying on the title syntax.
      We'll need get the values from the job visit object directly.
      I think ideally, we'll want to allow the user to define the
      contents of each "line" by selecting tokens from a predefined
      list of tokens (e.g., lastName, address, customFieldX, etc.)
      Might be nice if they could choose which of the tokens was the
      link-out to the visit in Jobber. ??
      The following will need retooling:
      - jobIdentifier
      - address
      - geoCode (custom field)
      - workCode (custom field)
      */
      const jobIdentifier = titleParts[0].trim();
      const geoCode = titleParts[1] ? titleParts[1].trim() : '?';
      const address = titleParts[2] ? titleParts[2].trim() : '?';
      const workCode = titleParts[3] ? titleParts[3].trim() : '?';
      const visitId = atob(edge.node.id).replace(/gid:\/\/Jobber\/Visit\//, '');
      const jobberWebUri = edge.node.job.jobberWebUri + '?appointment_id=' + visitId;
      const googleMapsUrl = `https://www.google.com/maps/place/${address.replace(/\s\/\s/g, '+').replace(/\s/g, '+')}+Spokane,WA`;
      const jobdate = formatDate(edge.node.startAt);

      const jobStartTime = formatTime(edge.node.startAt);
      const jobEndTime = formatTime(edge.node.endAt);
      const jobtime = (() => {
        if (!settings.showTime) return '';
        let theTime = (jobStartTime && jobStartTime !== "12:00 AM")
          && (jobEndTime && jobEndTime !== "11:59 PM")
          ? (jobStartTime + "-" + jobEndTime)
          : (jobStartTime && jobStartTime !== "12:00 AM")
            ? jobStartTime
            : (jobEndTime && jobEndTime !== "11:59 PM")
            ? jobEndTime
            : '';
        theTime = theTime.replace(/\s?(AM|PM)/gi, '').trim();
        return theTime;
      })();

      // Annual selector filtering
      if (settings.annual === "exclude") {
        if (jobIdentifier.includes('=')) {
          includingLine = false;
        }
      } else if (settings.annual === "excludeUnconfirmed") {
        if (jobIdentifier.includes('=') && jobIdentifier.startsWith('=')) {
          includingLine = false;
        }
      } else if (settings.annual === "annualOnly") {
        if (!jobIdentifier.includes('=')) {
          includingLine = false;
        }
      } else if (settings.annual === "annualOnlyConfirmed") {
        if (!jobIdentifier.includes('=') || jobIdentifier.startsWith('=')) {
          includingLine = false;
        }
      } else if (settings.annual === "annualOnlyUnconfirmed") {
        if (!jobIdentifier.includes('=') || !jobIdentifier.startsWith('=')) {
          includingLine = false;
        }
      }

      // Salesperson filter
      if (includingLine && settings.salespersonFilter === 'showSelected') {
        if (settings.selectedSalespeople.length === 0 || !settings.selectedSalespeople.includes(salespersonName)) {
          includingLine = false;
        }
      }

      // Day filter
      if (includingLine && settings.dayFilter === 'showSelected') {
        const jobDate = new Date(edge.node.startAt);
        const dayOfWeek = jobDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayName = dayNames[dayOfWeek];

        if (!settings.selectedDays || settings.selectedDays.length === 0 || !settings.selectedDays.includes(dayName)) {
          includingLine = false;
        }
      }

      // Text filter
      if (includingLine && filterText && !edge.node.title.toLowerCase().includes(filterText.toLowerCase())) {
        includingLine = false;
      }

      // IF WE **ARE** INCLUDING THE LINE:
      if (includingLine) {
        jobCount++;
        total += edge.node.job.total || 0;

        // Format the job line
        if (formatType === 'markdown') {
          // Dates
          if (settings.showDates) {
            if (settings.dateDisplayType === "all") {
              jobLines += ` **\`${jobdate}\`** `;
            } else if (settings.dateDisplayType === "weekdayOnly" && !jobdate.startsWith("Sun ") && !jobdate.startsWith("Sat ")) {
              jobLines += ` **\`${jobdate}\`** `;
            } else if (settings.dateDisplayType === "weekendOnly" && (jobdate.startsWith("Sun ") || jobdate.startsWith("Sat "))) {
              jobLines += ` **\`${jobdate}\`** `;
            }
          }

          // Format the job line as Markdown
          jobLines += `[**${jobIdentifier}**](${jobberWebUri}) ${geoCode} [${address}](${googleMapsUrl}) - ${workCode}`;

          // Time
          if (settings.showTime && jobtime !== '') {
            jobLines += ` **\`${jobtime}\`**`;
          }

          // Value and Salesperson
          if (settings.showValue) {
            jobLines += ` \`$${edge.node.job.total ? edge.node.job.total : '?'}\``;
          }
          if (settings.showSalesperson) {
            jobLines += ` \`${salespersonName}\``;
          }
        } else
        if (formatType === 'plaintext') {
          jobLines += `${jobIdentifier} ${geoCode} ${address} - ${workCode}`;
          if (settings.showDates) {
            if (settings.dateDisplayType === "all") {
              jobLines += ` ${jobdate}`;
            } else if (settings.dateDisplayType === "weekdayOnly" && !jobdate.startsWith("Sun ") && !jobdate.startsWith("Sat ")) {
              jobLines += ` ${jobdate}`;
            } else if (settings.dateDisplayType === "weekendOnly" && (jobdate.startsWith("Sun ") || jobdate.startsWith("Sat "))) {
              jobLines += ` ${jobdate}`;
            }
          }
          if (settings.showTime) {
            jobLines += ` ${jobtime}`;
          }
          if (settings.showValue) {
            jobLines += ` - $${edge.node.job.total ? edge.node.job.total : '?'}`;
          }
          if (settings.showSalesperson) {
            jobLines += ` - ${salespersonName}`;
          }
        }

        jobLines += '\n\n';
      }
    });

    // Add range info header
    if (settings.showRangeInfo && startDate && endDate) {
      const formattedStartDate = formatDate(startDate.toISOString());
      const formattedEndDate = formatDate(endDate.toISOString());

      if (formatType === 'markdown') {
        if (settings.showValue) {
          output += `# **${formattedStartDate} &ndash; ${formattedEndDate}** **\`${jobCount} Jobs\`** **\`$${total}\`**\n\n`;
        } else {
          output += `# **${formattedStartDate} &ndash; ${formattedEndDate}** **\`${jobCount} Jobs\`**\n\n`;
        }
      } else if (formatType === 'plaintext') {
        if (settings.showValue) {
          output += `${formattedStartDate}&ndash;${formattedEndDate}, ${jobCount} Jobs, $${total}\n\n------------------------------\n\n`;
        } else {
          output += `${formattedStartDate}&ndash;${formattedEndDate}, ${jobCount} Jobs\n\n------------------------------\n\n`;
        }
      }
    }

    output += jobLines;
    return output;
  // }
}
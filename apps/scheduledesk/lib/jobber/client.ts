// Jobber GraphQL API client utilities

interface JobberGraphQLResponse<T> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: string[];
  }>;
}

export interface JobberUser {
  id: string;
  name: {
    first: string;
    last: string;
    full: string;
  };
  email?: {
    raw?: string;
  };
  phone?: {
    friendly?: string;
  };
}

export interface JobberUsersResponse {
  users: {
    nodes: JobberUser[];
  };
}

/**
 * Makes a GraphQL request to the Jobber API
 */
export async function jobberGraphQL<T>(
  query: string,
  variables: Record<string, any> = {},
  accessToken: string
): Promise<T> {
  const response = await fetch(process.env.JOBBER_API_URL!, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-JOBBER-GRAPHQL-VERSION': process.env.JOBBER_API_VERSION!
    },
    body: JSON.stringify({ query, variables })
  });

  if (!response.ok) {
    throw new Error(`Jobber API request failed: ${response.status} ${response.statusText}`);
  }

  const result: JobberGraphQLResponse<T> = await response.json();

  if (result.errors) {
    throw new Error(`Jobber GraphQL errors: ${result.errors.map(e => e.message).join(', ')}`);
  }

  if (!result.data) {
    throw new Error('Jobber API returned no data');
  }

  return result.data;
}

/**
 * Fetches all users from Jobber
 */
export async function fetchJobberUsers(accessToken: string): Promise<JobberUser[]> {
  const query = `
    query GetUsers {
      users(filter:{status:ACTIVATED}, first:40){
        nodes {
          id
          name {
            first
            last
            full
          }
          email { raw }
          phone { friendly }
        }
      }
    }
  `;

  const data = await jobberGraphQL<JobberUsersResponse>(query, {}, accessToken);
  return data.users.nodes;
}

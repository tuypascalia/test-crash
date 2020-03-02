/**
 * Copyright 2017 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

const functions = require('firebase-functions');
const rp = require('request-promise');

// Helper function that calculates the priority of the issue
function calculateIssuePriority(eventType) {
  // Run custom logic that can determine the priority or severity of this issue
  // For example, you can parse the stack trace to determine which part of your app
  // is causing the crash and assign priorities based on that

  // See https://docs.atlassian.com/jira/REST/cloud/#api/2/priority
  // to grab a list of priorities that's available for your project
  // For a default project, priorities are:
  // [{"name":"Highest","id":"1"},{"name": "High","id": "2"},{"name": "Medium","id": "3"},{"name": "Low","id": "4"},{"name": "Lowest","id": "5"}]

  // For the demonstration of this sample, let's assign a priority based on the event type
  if (eventType === 'velocityAlert') {
    // high impacting, return highest priority
    return 1;
  } else if (eventType === 'regressed') {
    // regressed issue, return medium priority
    return 3;
  } else {
    // new issues - return low priority
    return 4;
  }
}

// Helper function that parses the Jira project url and returns an object
// of the url fragments
function parseUrl(url) {
  // input url format: https://yourdomain.atlassian.net/projects/XX
  const matches = url.match(/(https?:\/\/)(.+?)(\/.+)?\/(projects|browse)\/([\w-]+)/);
  if (matches && matches.length === 6) {
    return {protocol: matches[1], domain: matches[2], contextPath: matches[3] || '', projectKey: matches[5]};
  } else {
    throw new Error('Unexpected URL Format');
  }
}

// Helper function that posts to Jira to create a new issue
function createJiraIssue(summary, description, priority) {
  const project_url = functions.config().jira.project_url;
  const user = functions.config().jira.user;
  const pass = functions.config().jira.pass;
  const issue_type = functions.config().jira.issue_type;
  const component_id = functions.config().jira.component_id;

  const {protocol, domain, contextPath, projectKey} = parseUrl(project_url);
  const baseUrl = [protocol, domain, contextPath].join('');
  const url = "https://api.github.com/repos/tuypascalia/test-crash/issues";

  // See https://developer.atlassian.com/jiradev/jira-apis/jira-rest-apis/jira-rest-api-tutorials/jira-rest-api-example-create-issue
  // to customize the new issue being created
  const newIssue =
    {
      "title": "Found a new bug",
      "body": "I'm having a new problem with this.",
      "assignees": [
        "tuypascalia"
      ],
      "labels": [
        "bug"
      ]

  };

  // Uses Basic Authentication
  // Jira Doc: https://developer.atlassian.com/jiradev/jira-apis/jira-rest-apis/jira-rest-api-tutorials/jira-rest-api-example-basic-authentication
  // Request (Promise) Doc: https://github.com/request/request#http-authentication
  return rp({
            headers: {
             'User-Agent': 'Github Issue Webtask'
             'Authorization': "token 7d7b0bb5065cdb0c5a054ef0e497cb8629123d85"
            },
            method: 'POST',
            uri: url,
            body: newIssue,
            json: true
  });
}

exports.createNewIssue = functions.crashlytics.issue().onNew(async (issue) => {
  await createJiraIssue("", "", "");
  console.log(`Created issue ${issueId} in Jira successfully`);
});

exports.createRegressedIssue = functions.crashlytics.issue().onRegressed(async (issue) => {
    await createJiraIssue("", "", "");
    console.log(`Created issue ${issueId} in Jira successfully`);
});

exports.createVelocityAlert = functions.crashlytics.issue().onVelocityAlert(async (issue) => {
    await createJiraIssue("", "", "");
    console.log(`Created issue ${issueId} in Jira successfully`);
});
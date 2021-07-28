/*
 * Copyright (c) 2019 - 2021 Dr. Krusche & Partner PartG. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 *
 * @author Stefan Krusche, Dr. Krusche & Partner PartG
 *
 */
import { WorksQueryType } from '../types';
import { DataSourceInstanceSettings } from '@grafana/data';
/**
 * The links defined below refer to the GDELT application
 * that leverages Grafana to visualize the knowledge networks
 * extract from GDELT events, mentions and graph.
 *
 * The specified links appear in a node's context menu.
 * Note, these links are project specific, but they also
 * ensure that a context menu is visible at all.
 *
 * The 'NodeGraph' panel features seems to be still beta.
 */
export function makeLinks(itemQuery: string, instanceSettings: DataSourceInstanceSettings) {
  const makeLink = linkFactory(itemQuery, instanceSettings);
  return [makeLink('GDELT/Events', WorksQueryType.getEvents), makeLink('GDELT/Mentions', WorksQueryType.getMentions)];
}

function linkFactory(itemQuery: string, instanceSettings: DataSourceInstanceSettings) {
  return (title: string, queryType: WorksQueryType) => {
    return {
      title,
      url: '',
      internal: {
        query: {
          queryType,
          query: itemQuery,
        },
        datasourceUid: instanceSettings.uid,
        datasourceName: instanceSettings.name,
      },
    };
  };
}

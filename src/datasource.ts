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
import { sortBy } from 'lodash';

import { Observable } from 'rxjs';

import { DataQueryRequest, DataQueryResponse, DataSourceApi, DataSourceInstanceSettings } from '@grafana/data';

import { BackendSrvRequest, getBackendSrv } from '@grafana/runtime';

import { makeLinks } from './utils/links';
import { parseGraphResponse } from './utils/transform';
import { Dataset, Edge, Node, WorksQuery, WorksOptions } from './types';

export class WorksDataSource extends DataSourceApi<WorksQuery, WorksOptions> {
  constructor(private instanceSettings: DataSourceInstanceSettings<WorksOptions>) {
    super(instanceSettings);
  }

  async query(request: DataQueryRequest<WorksQuery>): Promise<DataQueryResponse> {
    /*
     * Extract the queries from the provided request. Note, the current
     * implementation does not support multiple queries. Therefore, the
     * first query provided is used.
     */
    const target = request.targets[0];

    const res = await this._post('/network', target, { hideFromInspector: true }).toPromise();
    const data = res.data;
    /*
     * The response specifies an object with 2 entries,
     * `nodes` and `edges`.
     */
    const nodes: Node[] = data.nodes.map((n: any) => ({
      id: n.id,
      title: n.title,
      subTitle: n.subTitle,
      mainStat: n.mainStat,
    }));

    const edges: Edge[] = data.edges.map((e: any) => ({
      id: e.id,
      src: e.src,
      dst: e.dst,
      mainStat: e.name,
    }));
    /**
     * The approach below adds pre-defined links to the node
     * context menu and also ensures that the context menu is
     * visible at all.
     */
    const nodeQuery = 'node(name: "${__data.fields.title}", type: "${__data.fields.subTitle}")';
    const [nodesFrame, edgesFrame] = parseGraphResponse(nodes, edges, target);

    nodesFrame.fields[0].config = {
      links: makeLinks(nodeQuery, this.instanceSettings),
    };

    return { data: [nodesFrame, edgesFrame] } as DataQueryResponse;
  }
  /**
   * This method supports Grafana's connection test and
   * pings the backend service. In case of success, the
   * status `success` is return and a message that GraphWorks.
   * accepted the connection.
   */
  async testDatasource() {
    const res = await this._get('/ping', { hideFromInspector: false }).toPromise();
    const data = res.data;
    return {
      status: data.status,
      message: data.message,
    };
  }
  /**
   * The PredictiveWorks. backend provides a set of network graphs,
   * that can be accessed through their names. This method retrieves
   * the list of this names prepared to be used within a SELECT field.
   */
  async getDatasets(): Promise<Dataset[]> {
    const res = await this._get('/datasets', { hideFromInspector: true }).toPromise();
    const data = res.data;
    return [
      ...sortBy(
        data.map((r: any) => ({
          index: r.index,
          label: r.label,
          value: r.value,
        })),
        'label'
      ),
    ];
  }
  /**
   * A common helper method to manage GET requests
   */
  _get(apiUrl: string, options?: Partial<BackendSrvRequest>): Observable<Record<string, any>> {
    const baseUrl = this.instanceSettings.url;
    const url = `${baseUrl}${apiUrl}`;
    /*
     * Assign credentials, in case they have been configured
     */
    if (this.instanceSettings.withCredentials || this.instanceSettings.basicAuth) {
      options = { ...options, withCredentials: true };
      if (this.instanceSettings.basicAuth) {
        options.headers = { ...options.headers, Authorization: this.instanceSettings.basicAuth };
      }
    }
    const req = {
      ...options,
      url,
    };

    return getBackendSrv().fetch<Record<string, any>>(req);
  }
  /**
   * A common helper method to manage POST requests
   */
  _post(apiUrl: string, query: WorksQuery, options?: Partial<BackendSrvRequest>): Observable<Record<string, any>> {
    const baseUrl = this.instanceSettings.url;
    const url = `${baseUrl}${apiUrl}`;
    /*
     * Assign credentials, in case they have been configured
     */
    if (this.instanceSettings.withCredentials || this.instanceSettings.basicAuth) {
      options = { ...options, withCredentials: true };
      if (this.instanceSettings.basicAuth) {
        options.headers = { ...options.headers, Authorization: this.instanceSettings.basicAuth };
      }
    }

    const data = {
      dataset: query.dataset,
      query: query.query || '',
      type: query.queryType || '',
    };

    const method = 'POST';
    const req = {
      ...options,
      url,
      method,
      data,
    };

    return getBackendSrv().fetch<Record<string, any>>(req);
  }
}

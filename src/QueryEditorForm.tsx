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
import React from 'react';
import { css } from 'emotion';

import { WorksDataSource } from './datasource';
import { Dataset, WorksQuery, WorksOptions } from './types';

import { QueryEditorProps } from '@grafana/data';
import { InlineFormLabel, Input, Select, stylesFactory } from '@grafana/ui';

export type WorksQueryEditorFormProps = QueryEditorProps<WorksDataSource, WorksQuery, WorksOptions> & {
  datasets: Dataset[];
};

const getStyles = stylesFactory(() => ({
  datasetSelect: css`
    margin-right: 4px;
  `,
  queryInput: css`
    margin-right: 4px;
  `,
}));

export function QueryEditorForm({ query, onChange, datasets }: WorksQueryEditorFormProps) {
  const allDatasets = [...datasets];
  const styles = getStyles();
  return (
    <div>
      <div className="gf-form">
        <InlineFormLabel className="query-keyword" width="auto">
          Dataset
        </InlineFormLabel>
        <Select
          className={styles.datasetSelect}
          options={allDatasets}
          value={query.dataset}
          onChange={(v) =>
            onChange({
              ...query,
              dataset: v.value,
            })
          }
        />
      </div>
      <div className="gf-form">
        <InlineFormLabel className="query-keyword" width="auto">
          Query
        </InlineFormLabel>
        <Input
          className={styles.queryInput}
          placeholder="Provide query (optional)"
          value={query.query}
          onChange={(e) =>
            onChange({
              ...query,
              query: e.currentTarget.value,
            })
          }
        />
      </div>
    </div>
  );
}

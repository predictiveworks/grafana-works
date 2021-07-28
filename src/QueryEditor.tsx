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
import { Spinner } from '@grafana/ui';
import { useDatasets } from './useDatasets';
import { QueryEditorForm, WorksQueryEditorFormProps } from './QueryEditorForm';

export function QueryEditor(props: Omit<WorksQueryEditorFormProps, 'datasets'>) {
  const datasets = useDatasets(props.datasource);
  /*
   * We need a wrapper to wait for the datasets and only
   * after that run the useInitQuery as it needs to know
   * the datasets at this point.
   */
  if (!datasets) {
    return <Spinner />;
  } else {
    return <QueryEditorForm {...{ ...props, datasets }} />;
  }
}

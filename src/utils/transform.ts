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
import {
  ArrayVector,
  DataFrame,
  FieldColorModeId,
  FieldType,
  MutableDataFrame,
  PreferredVisualisationType,
} from '@grafana/data';

import { Edge, Node, WorksQuery } from '../types';
import { NodeGraphDataFrameFieldNames } from '@grafana/ui';
/**
 * @grafana/ui has no type declaration; therefore
 * the fields names are defined here.
 */
const FIELD_ID = NodeGraphDataFrameFieldNames.id;
const FIELD_MAINSTAT = NodeGraphDataFrameFieldNames.mainStat;
const FIELD_SOURCE = NodeGraphDataFrameFieldNames.source;
const FIELD_SUBTITLE = NodeGraphDataFrameFieldNames.subTitle;
const FIELD_TARGET = NodeGraphDataFrameFieldNames.target;
const FIELD_TITLE = NodeGraphDataFrameFieldNames.title;
/**
 * Get data frame to be shown in NodeGraph in Grafana.
 */
export function parseGraphResponse(rawNodes: Node[], rawEdges: Edge[], _query?: WorksQuery): DataFrame[] {
  /**
   * idField
   *
   * This field is mandatory. It specifies the unique
   * identifier of the node. This ID is referenced by
   * edge in it’s source and target field.
   */
  const idField = {
    name: FIELD_ID,
    type: FieldType.string,
    values: new ArrayVector(),
  };
  /**
   * titleField
   *
   * This field is optional. Name of the node visible just
   * under the node.
   */
  const titleField = {
    name: FIELD_TITLE,
    type: FieldType.string,
    values: new ArrayVector(),
    /*
     * The displayName is used in the context menu that
     * refers to a specific node.
     */
    config: { displayName: 'Name' },
  };
  /**
   * subTitleField
   *
   * Additional, name, type or other identifier that will
   * be shown right under the title.
   */
  const subTitleField = {
    name: FIELD_SUBTITLE,
    type: FieldType.string,
    values: new ArrayVector(),
    config: { displayName: 'Type' },
  };
  /**
   * mainStatField
   *
   * First stat shown inside the node itself. Can be either
   * string in which case the value will be shown as it is
   * or it can be a number in which case any unit associated
   * with that field will be also shown.
   */
  const mainStatField = {
    name: FIELD_MAINSTAT,
    type: FieldType.number,
    values: new ArrayVector(),
    config: { displayName: 'Score' },
  };

  // /**
  //  * brandField (leverages the `brand` color)
  //  *
  //  * This field is used to draw a colored circle
  //  */
  // const brandField = {
  //   name: NodeGraphDataFrameFieldNames.arc + 'brand',
  //   type: FieldType.number,
  //   values: new ArrayVector(),
  //   config: { color: { fixedColor: '#1bacab', mode: FieldColorModeId.Fixed } },
  // };

  // /**
  //  * caseField (leverages the `case` color)
  //  *
  //  * This field is used to draw a colored circle
  //  */
  // const caseField = {
  //   name: NodeGraphDataFrameFieldNames.arc + 'case',
  //   type: FieldType.number,
  //   values: new ArrayVector(),
  //   config: { color: { fixedColor: '#fd7e14', mode: FieldColorModeId.Fixed } },
  // };
  /**
   * defaultField (leverages the `default` color)
   *
   * This field is used to draw a colored circle
   */
  const defaultField = {
    name: NodeGraphDataFrameFieldNames.arc + 'default',
    type: FieldType.number,
    values: new ArrayVector(),
    config: { color: { fixedColor: '#5a84e4', mode: FieldColorModeId.Fixed } },
  };

  const negativeField = {
    name: NodeGraphDataFrameFieldNames.arc + 'negative',
    type: FieldType.number,
    values: new ArrayVector(),
    config: { color: { fixedColor: 'red', mode: FieldColorModeId.Fixed } },
  };

  const neutralField = {
    name: NodeGraphDataFrameFieldNames.arc + 'neutral',
    type: FieldType.number,
    values: new ArrayVector(),
    config: { color: { fixedColor: '#800080', mode: FieldColorModeId.Fixed } },
  };

  const positiveField = {
    name: NodeGraphDataFrameFieldNames.arc + 'positive',
    type: FieldType.number,
    values: new ArrayVector(),
    config: { color: { fixedColor: 'green', mode: FieldColorModeId.Fixed } },
  };

  /**
   * idField
   *
   * This field is mandatory. Unique identifier of the edge.
   */
  const edgeIdField = {
    name: FIELD_ID,
    type: FieldType.string,
    values: new ArrayVector(),
  };
  /**
   * edgeSourceField
   *
   * This field is mandatory. It specifies the Id of the source node.
   */
  const edgeSourceField = {
    name: FIELD_SOURCE,
    type: FieldType.string,
    values: new ArrayVector(),
  };
  /**
   * edgeTargetField
   *
   *  This field is mandatory. It specifies the Id of the target node.
   */
  const edgeTargetField = {
    name: FIELD_TARGET,
    type: FieldType.string,
    values: new ArrayVector(),
  };
  /**
   * mainStat
   *
   * First stat shown in the overlay when hovering over the edge. Can be
   * either string in which case the value will be shown as it is or it
   * can be a number in which case any unit associated with that field
   * will be also shown.
   *
   * The current implementation leverages the `mainStat` field to assign
   * a label to an edge or the relationship field.
   *
   * If both field are available, the secondaryStat is also used.
   */
  const edgeMainStatField = {
    name: FIELD_MAINSTAT,
    type: FieldType.string,
    values: new ArrayVector(),
    config: { displayName: 'Label' },
  };

  /** Transform response into nodes & edges **/

  for (const rawNode of rawNodes) {
    idField.values.add(rawNode.id);
    titleField.values.add(rawNode.title);

    subTitleField.values.add(rawNode.subTitle);
    mainStatField.values.add(rawNode.mainStat);
    /*
     * Determine the color fraction
     */
    let defaultColor = 0.0;
    let negativeColor = 0.0;

    let neutralColor = 0.0;
    let positiveColor = 0.0;

    switch (rawNode.subTitle) {
      case 'default':
        defaultColor = 1.0;
        break;
      case 'negative':
        negativeColor = 1.0;
        break;
      case 'neutral':
        neutralColor = 1.0;
        break;
      case 'positive':
        positiveColor = 1.0;
        break;
      default:
        defaultColor = 1.0;
        break;
    }

    defaultField.values.add(defaultColor);
    negativeField.values.add(negativeColor);

    neutralField.values.add(neutralColor);
    positiveField.values.add(positiveColor);
  }

  for (const rawEdge of rawEdges) {
    edgeIdField.values.add(rawEdge.id);
    edgeSourceField.values.add(rawEdge.src);
    edgeTargetField.values.add(rawEdge.dst);
    edgeMainStatField.values.add(rawEdge.mainStat);
  }
  /*
   * Build the nodes and edges dataframe and
   * wrap as MutableDataFrame
   */
  const visualisationType: PreferredVisualisationType = 'nodeGraph';
  const nodes = {
    name: 'nodes',
    refId: '*',
    fields: [
      idField,
      titleField,
      subTitleField,
      mainStatField,
      defaultField,
      negativeField,
      neutralField,
      positiveField,
    ],
    meta: {
      preferredVisualisationType: visualisationType,
    },
  };

  const edges = {
    name: 'edges',
    refId: '*',
    fields: [edgeIdField, edgeSourceField, edgeTargetField],
    meta: {
      preferredVisualisationType: visualisationType,
    },
  };
  return [new MutableDataFrame(nodes), new MutableDataFrame(edges)];
}

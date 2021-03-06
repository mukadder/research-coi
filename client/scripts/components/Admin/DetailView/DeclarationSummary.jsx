/*
    The Conflict of Interest (COI) module of Kuali Research
    Copyright © 2015 Kuali, Inc.

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>
*/

import React from 'react/addons';
import {merge} from '../../../merge';
import ConfigStore from '../../../stores/ConfigStore';
import {AdminActions} from '../../../actions/AdminActions';
import {COIConstants} from '../../../../../COIConstants';

export default class DeclarationSummary extends React.Component {
  constructor() {
    super();

    this.showComments = this.showComments.bind(this);
  }

  showComments() {
    AdminActions.showCommentingPanel(COIConstants.DISCLOSURE_STEP.PROJECTS, this.props.declaration.id, this.props.declaration.projectTitle + ' - ' + this.props.declaration.entityName);
  }

  render() {
    let styles = {
      container: {
        fontSize: 12,
        marginBottom: 10
      },
      highlighted: {
        borderLeft: window.colorBlindModeOn ? '10px solid black' : '10px solid #F57C00',
        marginLeft: -20,
        paddingLeft: 10
      },
      entityName: {
        width: '25%',
        display: 'inline-block'
      },
      conflict: {
        width: '25%',
        display: 'inline-block'
      },
      comments: {
        width: '50%',
        display: 'inline-block',
        verticalAlign: 'top'
      },
      commentLink: {
        fontSize: 14,
        cursor: 'pointer',
        margin: '14px 0 34px 0',
        textAlign: 'right'
      },
      commentLabel: {
        color: window.colorBlindModeOn ? 'black' : '#0095A0',
        borderBottom: window.colorBlindModeOn ? '1px dashed black' : '1px dashed #0095A0',
        paddingBottom: 3
      },
      noComment: {
        color: window.colorBlindModeOn ? 'black' : '#CCC'
      }
    };

    let effectiveStyle = styles.container;
    if (this.props.changedByPI) {
      effectiveStyle = merge(effectiveStyle, styles.highlighted);
    }
    effectiveStyle = merge(effectiveStyle, this.props.style);

    let comment;
    if (this.props.declaration.comments) {
      comment = (
        <span>{this.props.declaration.comments}</span>
      );
    }
    else {
      comment = (
        <span style={styles.noComment}>none</span>
      );
    }

    return (
      <div style={effectiveStyle}>
        <div>
          <span style={merge(styles.entityName, {fontWeight: 'bold'})}>
            {this.props.declaration.entityName}
          </span>
          <span style={merge(styles.conflict, {fontWeight: 'bold'})}>
            {ConfigStore.getDeclarationTypeString(this.props.declaration.typeCd)}
          </span>
          <span style={merge(styles.comments, {fontStyle: 'italic'})}>
            {comment}
          </span>
        </div>
        <div style={styles.commentLink} onClick={this.showComments}>
          <span style={styles.commentLabel}>COMMENT ({this.props.commentCount})</span>
        </div>
      </div>
    );
  }
}

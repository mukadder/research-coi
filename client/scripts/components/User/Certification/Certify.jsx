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

import React from 'react/addons'; //eslint-disable-line no-unused-vars
import {merge} from '../../../merge';
import {COIConstants} from '../../../../../COIConstants';
import {Instructions} from '../Instructions';
import {DisclosureActions} from '../../../actions/DisclosureActions';
import {FileUpload} from '../../FileUpload';

export class Certify extends React.Component {
  constructor() {
    super();

    this.certify = this.certify.bind(this);
    this.addDisclosureAttachment = this.addDisclosureAttachment.bind(this);
    this.deleteDisclosureAttachment = this.deleteDisclosureAttachment.bind(this);
  }

  addDisclosureAttachment(files) {
    DisclosureActions.addDisclosureAttachment(files);
  }

  deleteDisclosureAttachment(index) {
    DisclosureActions.deleteDisclosureAttachment(index);
  }

  certify(evt) {
    DisclosureActions.certify(evt.target.checked);
  }

  shouldComponentUpdate() { return true; }

  render() {
    let styles = {
      container: {
        overflow: 'hidden'
      },
      content: {
        display: 'inline-block',
        padding: '46px 0 0 50px'
      },
      p: {
        fontSize: '16px'
      },
      ul: {
        fontSize: '16px'
      },
      cert: {
        backgroundColor: 'white',
        padding: '20px 30px',
        borderRadius: 5,
        boxShadow: '0px 0px 3px 1px #CCC',
        marginRight: 3,
        marginBottom: 3,
        display: 'inline-block'
      }
    };

    let instructionText = window.config.general.instructions[COIConstants.INSTRUCTION_STEP.CERTIFICATION];
    let instructions = (
      <Instructions
        text={instructionText}
        collapsed={!this.props.instructionsShowing}
      />
    );

    let agreement;

    if (window.config.general.certificationOptions.required) {
      agreement = (
      <div style={{marginTop: 20}}>
          <span style={{display: 'inline-block', width: '5%'}}>
            <input type="checkbox" id="certCheckbox" onChange={this.certify} checked={this.props.isCertified}/>
          </span>
          <label htmlFor="certCheckbox" style={{display: 'inline-block', width: '95%', verticalAlign: 'top', fontWeight: 'bold'}}>
            I acknowledge that it is my responsibility to disclose any new SIGNIFICANT FINANCIAL
            INTERESTS obtained during the term of this disclosure. I certify that this is a complete
            disclosure of all my financial interests related to the projects therein.
          </label>
      </div>
      );
    }
    return (
      <div style={merge(styles.container, this.props.style)}>
        {instructions}

        <div style={styles.content}>
          <span style={styles.cert}>
            <div style={{whiteSpace: 'pre-wrap', marginBottom: 25}}>
              {window.config.general.certificationOptions.text}
            </div>
            <FileUpload
              fileType='Attachment'
              readOnly={false}
              onDrop={this.addDisclosureAttachment}
              delete={this.deleteDisclosureAttachment}
              files={this.props.files}
              multiple={true}
            >
              <div>Drag and Drop or Click to upload your attachments</div>
              <div>Acceptable Formats: .pdf, .png, .doc, .jpeg</div>
            </FileUpload>
            {agreement}
          </span>
        </div>
      </div>
    );
  }
}

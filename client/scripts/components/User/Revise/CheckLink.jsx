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

export default class CheckLink extends React.Component {
  render() {
    let styles = {
      container: {
        marginRight: 20,
        cursor: this.props.disabled ? 'default' : 'pointer'
      },
      link: {
        borderBottom: this.props.disabled ? '#AAA' : this.props.checked ? window.colorBlindModeOn ? '1px dashed black' : '1px dashed #00D000' : '1px dashed #888',
        color: this.props.disabled ? '#AAA' : this.props.checked ? window.colorBlindModeOn ? 'black' : '#00D000' : '#666'
      },
      checkmark: {
        color: this.props.checked ? window.colorBlindModeOn ? 'black' : '#00D000' : 'transparent',
        marginRight: 3
      }
    };

    let check = (
      <i className="fa fa-check" style={styles.checkmark}></i>
    );

    return (
      <span style={merge(styles.container, this.props.style)} onClick={this.props.onClick}>
        {check}
        <span style={styles.link}>
          {this.props.children}
        </span>
      </span>
    );
  }
}

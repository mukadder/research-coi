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
import {merge} from '../../merge';

export default class DoneWithFilterButton extends React.Component {
  render() {
    let styles = {
      container: {
        height: 27
      },
      closeLink: {
        float: 'right',
        cursor: 'pointer',
        marginRight: 10,
        color: window.colorBlindModeOn ? 'black' : '#0095A0',
        fontSize: 13
      },
      x: {
        fontSize: 17,
        paddingRight: 5,
        display: 'inline-block'
      }
    };

    return (
      <div style={merge(styles.container, this.props.style)} onClick={this.props.onClick}>
        <span onClick={this.done} style={styles.closeLink}>
          <i className="fa fa-times" style={styles.x}></i>
          CLOSE
        </span>
      </div>
    );
  }
}

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

import {getUserInfo} from '../services/AuthService/AuthService';
import Log from '../Log';

function getAuthToken(header) {
  try {
    let parsedHeader = header.split(' ');
    if (parsedHeader[0] === 'Bearer') {
      return parsedHeader[1];
    } else {
      return undefined;
    }
  } catch(e) {
    return undefined;
  }
}

export default function authentication(req, res, next) {
  let authToken = getAuthToken(req.headers.authorization);
  if (req.url.startsWith('/coi/files') && req.method === 'GET' && !authToken) {
    authToken = req.cookies.authToken;
  }

  getUserInfo(req.dbInfo, req.hostname, authToken)
    .then(userInfo => {
      if (!userInfo) {
        res.sendStatus(401);
      } else {
        req.userInfo = userInfo;
        next();
      }
    }).catch(err => {
      Log.error(err);
      next(err);
    });
}


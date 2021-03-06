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

var path = require('path');

module.exports = {
  entry: {
    user: './client/scripts/components/User/app.jsx',
    admin: './client/scripts/components/Admin/admin.jsx',
    config: './client/scripts/components/Config/config.jsx'
  },
  output: {
    path: path.join(__dirname, 'client/build'),
    filename: '[name].js',
    sourceMapFilename: '[file].map'
  },
  resolve: {
    extensions: ['', '.jsx', '.css', '.js']
  },
  module: {
    loaders: [
      {
        test: /\.js/,
        exclude: /(node_modules)/,
        loader: 'babel-loader?cacheDirectory=true'
      },
      {
        test: /\.jsx/,
        exclude: /(node_modules)/,
        loader: 'babel-loader?cacheDirectory=true'
      },
      {test: /\.css/, loader: 'style!css'}
    ]
  }
};

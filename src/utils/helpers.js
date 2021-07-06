import { find } from 'lodash';
import { ID_DELIMITER, FIRST_ITEM } from './constants';

export const parseId = rawId => rawId.split(ID_DELIMITER)[FIRST_ITEM];

export const formatDate = date => {
  var d = new Date(date),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2)
    month = '0' + month;
  if (day.length < 2)
    day = '0' + day;

  return [year, month, day].join('-');
}

export const getKeyLabel = ({ key, formFields }) => {
  const formField = find(formFields, { id: key });

  return formField?.label || `[${parseId(key)}]`;
}

export const formatHtml = html => {
    var tab = '  ';
    var result = '';
    var indent= '';

    html.split(/>\s*</).forEach(function(element) {
        if (element.match( /^\/\w/ )) {
            indent = indent.substring(tab.length);
        }

        result += indent + '<' + element + '>\r\n';

        if (element.match( /^<?\w[^>]*[^\/]$/ ) && !element.startsWith("input")  ) {
            indent += tab;
        }
    });

    return result.substring(1, result.length-3);
}

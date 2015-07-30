function isAfterStartDate(dateFilter) {
    return function(disclosure) {
      let dateToUse = disclosure.revisedOn;
      if (!dateToUse) {
        dateToUse = disclosure.submittedOn;
      }
      if (dateFilter.start) {
        return dateToUse >= dateFilter.start;
      }
      else {
        return true;
      }
    };
  }

function isBeforeEndDate(dateFilter) {
    return function(disclosure) {
      let dateToUse = disclosure.revisedOn;
      if (!dateToUse) {
        dateToUse = disclosure.submittedOn;
      }
      if (dateFilter.end) {
        return dateToUse <= dateFilter.end;
      }
      else {
        return true;
      }
    };
  }

function sortFunction(sortDirection) {
  return function(a, b) {
    let aDateToUse = a.revisedOn;
    if (!aDateToUse) {
      aDateToUse = a.submittedOn;
    }
    let bDateToUse = b.revisedOn;
    if (!bDateToUse) {
      bDateToUse = b.submittedOn;
    }

    if (aDateToUse && bDateToUse) {
      if (sortDirection === 'DESCENDING') {
        return bDateToUse - aDateToUse;
      }
      else {
        return aDateToUse - bDateToUse;
      }
    }
    else {
      return 0;
    }
  };
}

function typeFilter(type) {
    return function(disclosure) {
      if (type) {
        if (type.annual && disclosure.type === 'ANNUAL') {
          return true;
        }
        else if (type.project && disclosure.type === 'PROJECT') {
          return true;
        }
        else {
          return false;
        }
      }
      else {
        return true;
      }
    };
  }

function statusFilter(status) {
    return function(disclosure) {
      if (status) {
        if (status.inProgress && disclosure.status === 'IN_PROGRESS') {
          return true;
        }
        else if (status.awaitingReview && disclosure.status === 'AWAITING_REVIEW') {
          return true;
        }
        else if (status.revisionNecessary && disclosure.status === 'REVISION_NECESSARY') {
          return true;
        }
        else {
          return false;
        }
      }
      else {
        return true;
      }
    };
  }
module.exports = {
        isAfterStartDate: isAfterStartDate,
        isBeforeEndDate: isBeforeEndDate,
        sortFunction: sortFunction,
        typeFilter: typeFilter,
        statusFilter: statusFilter
    };
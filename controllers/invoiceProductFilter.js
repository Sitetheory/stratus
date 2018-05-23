// Invoice Product Filter Controller
// -----------------

/* global define */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([
      'stratus',
      'underscore',
      'angular'
    ], factory)
  } else {
    factory(root.Stratus, root._, root.angular)
  }
}(this, function (Stratus, _, angular) {
  // This Controller handles simple element binding
  // for a single scope to an API Object Reference.
  Stratus.Controllers.InvoiceProductFilter = [
    '$scope',
    '$log',
    function ($scope, $log) {
      // Store Instance
      Stratus.Instances[_.uniqueId('invoice_product_filter_')] = $scope

      // Wrappers
      $scope.Stratus = Stratus
      $scope._ = _

      // the models get from collection
      $scope.timeStart = null
      $scope.timeEnd = null

      // status
      $scope.status = [
        {
          desc: 'Cancelled',
          value: -1
        },
        {
          desc: 'Active',
          value: 1
        },
        {
          desc: 'Pending Activation',
          value: 0
        }
      ]

      // status selected
      $scope.showOnly = []

      /**
       * Default Billing Increment Options for Product
       */
      $scope.billingIncrementOptions = {
        i: 'Minutely',
        h: 'Hourly',
        d: 'Daily',
        w: 'Weekly',
        m: 'Monthly',
        q: 'Quarterly',
        y: 'Yearly'
      }

      // handle click action
      $scope.toggle = function (value) {
        var index = $scope.showOnly.indexOf(value);
        (index !== -1)
          ? $scope.showOnly.splice(index, 1)
          : $scope.showOnly.push(value)
        filterStatus()
      }

      /**
       * Get status of invoice_product
       * Active: timeStart <= currentTime <= timeEnd
       * Pending Activation: currentTime < timeStart
       * Cancelled: timeEnd <= currentTime
       */
      $scope.getStatus = function (invoiceProduct) {
        var currentTime = new Date().getTime() / 1000
        if (!invoiceProduct) {
          return
        }
        var timeEnd = (invoiceProduct.timeEnd)
          ? invoiceProduct.timeEnd
          : currentTime + 1000
        var timeStart = invoiceProduct.timeStart || currentTime + 1000
        if (timeEnd <= currentTime) {
          return 'cancelled'
        }
        if (currentTime < timeStart) {
          return 'pendingActivation'
        }
        if (timeStart <= currentTime && currentTime <= timeEnd) {
          return 'active'
        }
      }

      /*
      * Filter by status: active: 1, inactive: 0, deleted: -1
      */
      function filterStatus () {
        filter('api.options.invoiceStatus', $scope.showOnly)
      }

      $scope.filterSite = function (siteId) {
        filter('api.options.siteId', siteId |= null)
      }

      $scope.filterProduct = function (productContentId) {
        filter('api.options.productContentId', productContentId |= null)
      }

      /*
      * call request include options to retrieve data filter
      */
      function filter (type, data) {
        $scope.collection.meta.set(type, data)
        $scope.collection.meta.set('api.options.limit', 1000)
        $scope.collection.fetch().then(function (response) {
          $log.log('response:', response)
        })
      }

      /*
      * Filter by start date OR end date
      */
      $scope.filterDateRanger = function () {
        // Reset timeStart and timeEnd options
        var options = $scope.collection.meta.get('api.options')
        if (options && options['timeStart']) delete options['timeStart']
        if (options && options['timeEnd']) delete options['timeEnd']

        // Prepare start date options
        if ($scope.timeStart) {
          if (angular.isDate($scope.timeStart)) {
            $scope.timeStart = new Date($scope.timeStart).setHours(0, 0, 0, 0) / 1000
          }
          setAttribute('api.options.timeStart', $scope.timeStart)
        }

        // Prepare end date options
        if ($scope.timeEnd) {
          if (angular.isDate($scope.timeEnd)) {
            $scope.timeEnd = new Date($scope.timeEnd).setHours(23, 59, 59, 999) / 1000
          }
          setAttribute('api.options.timeEnd', $scope.timeEnd)
        }

        // Can't filter with the time start later than the time end
        if ($scope.timeStart && $scope.timeEnd && $scope.timeStart > $scope.timeEnd) {
          return
        }

        $scope.collection.fetch().then(function (response) {})
      }

      /**
      * set an value for an attribute of a collection
      * @param attribute
      * @param value
      * @param collection
      */
      function setAttribute (attribute, value, collection) {
        collection = collection || $scope.collection
        collection.meta.set(attribute, value)
      }

      /**
      * find owningIdentity name of an invoice in the siteList and vendorList
      * @param invoice
      * @param siteList
      * @param vendorList
      * @return {string}
      */
      $scope.getSiteOrVendorName = function (invoice, siteList, vendorList) {
        var siteName = 'Site Not Found'
        var sites = (invoice.owningIdentity === 'SitetheoryHostingBundle:Site' ? siteList : vendorList) || []
        if (sites.length > 0) {
          sites.forEach(function (site) {
            if (site.id === invoice.owningIdentityId) {
              siteName = site.name
            }
          })
        }
        return siteName
      }

      /**
      * @param contentId
      * @param tagList
      * return
      */
      $scope.getTags = function (contentId, tagList) {
        var tags = []
        if (tagList && tagList.length > 0) {
          tagList.forEach(function (tag) {
            if (contentId === tag.assets[0].id) {
              if (tags.indexOf($scope.upperFirst(tag.name)) === -1) {
                tags.push($scope.upperFirst(tag.name))
              }
            }
          })
          return '(' + tags.toString() + ')'
        } else {
          if (!Stratus.Environment.get('production') &&
            !Array.isArray(tagList)) {
            console.warn('tagList is not an array')
          }
        }
        return ''
      }

      $scope.upperFirst = function (string) {
        return string.charAt(0).toUpperCase() + string.slice(1)
      }

      $scope.search = function (collection, query) {
        var results = collection.filter(query)
        return Promise.resolve(results).then(function (value) {
          var response = []
          if (value.InvoiceProduct) {
            response = response.concat(value.InvoiceProduct)
          }
          return response
        })
      }
    }]
}))

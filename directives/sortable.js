//     Stratus.Directives.Sortable.js 1.0

//     Copyright (c) 2016 by Sitetheory, All Rights Reserved
//
//     All information contained herein is, and remains the
//     property of Sitetheory and its suppliers, if any.
//     The intellectual and technical concepts contained herein
//     are proprietary to Sitetheory and its suppliers and may be
//     covered by U.S. and Foreign Patents, patents in process,
//     and are protected by trade secret or copyright law.
//     Dissemination of this information or reproduction of this
//     material is strictly forbidden unless prior written
//     permission is obtained from Sitetheory.
//
//     For full details and documentation:
//     http://docs.sitetheory.io

// Stratus Sortable Directive
// ----------------------

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['stratus', 'sortable', 'angular'], factory);
    } else {
        factory(root.Stratus, root.Sortable);
    }
}(this, function (Stratus, Sortable) {
    // This directive intends to provide basic sorting capabilities.
    Stratus.Directives.Sortable = function ($parse, $timeout) {
        return {
            scope: {
                itemArray: '=ngSortable',
                listItemSelector: '@ngSortableItemSelector',
                orderChanged: '&ngSortableOnChange'
            },
            link: function (scope, element, attrs) {
                // store reference
                this.uid = _.uniqueId('sortable_');
                Stratus.Instances[this.uid] = scope;
                Stratus.Instances[this.uid + '_element'] = element;

                var container = element;
                var originalContainerContent;
                var sort;
                var slice = Array.prototype.slice;

                // Create rubaxa sortable list
                sort = new Sortable(element[0], {
                    draggable: scope.listItemSelector,
                    onUpdate: onUpdate
                });

                // Events for when a drag begins
                container
                    .on('mousedown', onGrab)
                    .on('touchstart', onGrab)
                    .on('selectstart', onGrab);

                // When a drag event is begun
                function onGrab(event) {
                    // Save the current state of the list
                    originalContainerContent = container.contents();
                }

                // When the list order is updated
                function onUpdate(event) {
                    // Get the item that was clicked on
                    var clickedItem = angular.element(event.item);

                    // Get the Angular scope attached to the clicked element
                    var itemScope = clickedItem.scope();

                    // Get the original position of the dragged element
                    var originalPosition = itemScope.$index;

                    // Get the current order of dom nodes
                    var elementList = slice.call(container.children());

                    // Get the new position of the dragged element
                    var newPosition = elementList.indexOf(clickedItem[0]);

                    // Reset position of all dom elements (so ng-repeat's comments
                    // don't get broken). Note that append works here because the
                    // appended elements are references and so pull the re-ordered
                    // elements back into the original order.
                    container.append(originalContainerContent);

                    scope.$apply(function () {
                        // Adjust ng-repeat's array to match the drag changes
                        var movedItem = scope.itemArray.splice(originalPosition, 1)[0];
                        scope.itemArray.splice(newPosition, 0, movedItem);
                    });

                    // Call the user provided on change method
                    scope.orderChanged();
                }
            }
        };
    };
}));

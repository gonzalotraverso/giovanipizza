(function(){ var App = this.App = new Class() })();

App.extend({
    
  //variables setup
  Config : { 
    HashState : false,
    State : false,
    changeURI: true,
    PreviousFn : new Array(),
    ActiveFn : null
  },
  
  //Helper Functions
  Helper :  {
    
    Calendar : new Class({
    
      Implements: [Events, Options],
      
      options: {
        'slideDuration': 500,
        'fadeDuration': 200,
        'toggleDuration': 200,
        'fadeTransition': Fx.Transitions.linear,
        'slideTransition': Fx.Transitions.Quart.easeOut,
        
        'prefill': true,
        'defaultDate': null,
        'linkWithInput': true,
        'keyNavigation': false,
        
        'theme': 'default',
        'defaultView': 'month',
        'startMonday': false,
        'alwaysShow': false,
        'injectInsideTarget': false,
        'format': '%m/%d/%Y',
        'alignX': 'right',
        'alignY': 'ceiling',
        'offsetX': 0,
        'offsetY': 0,
        
        'draggable': false,
        'pickable': true,
        'toggler': null,
        'disallowUserInput': false,
        
        'minDate': null,
        'maxDate': null,
        'excludedWeekdays': null,
        'excludedDates': null,
        
        'createHiddenInput': false,
        'hiddenInputName': 'date',
        'hiddenInputFormat': '%t',
        
        'events': []
      },
      
      initialize: function(target, options) {
        this.setOptions(options);
        
        this.target = $(target);
        this.transitioning = false;
        this.today = new Date().clearTime();
        
        //Extend Date with unix timestamp parser
        Date.defineParser({
            re: /^[0-9]{10}$/,
            handler: function(bits) { return new Date.parse('Jan 01 1970').set('seconds', bits[0]); }
        });
        //Extend Date with a workaround for the '-' delimiter parse bug
        Date.defineParser({
            re: /\-/,
            handler: function(bits) { return new Date.parse(bits.input.replace(/\-/, '.')); }
        });
        
        //Create the currect selected date
        if($defined(this.options.defaultDate)) 
          this.selectedDate = new Date().parse(this.options.defaultDate).clearTime();
        else if(this.options.linkWithInput && $chk(this.target.get('value'))) 
          this.selectedDate = new Date().parse(this.initialDate(this.target.get('value'))).clearTime();
        if(!$defined(this.selectedDate) || !this.selectedDate.isValid()) 
          this.selectedDate = this.today.clone();
        
        //Create the HTML base of the calender
        var innerHtml = '<div class="c86-wrapper"><div class="c86-header"><div class="c86-arrow-left"></div><div class="c86-arrow-right"></div><div class="c86-label c86-clickable"></div></div>'+
                  '<div class="c86-body"><div class="c86-inner"><div class="c86-container a"></div><div class="c86-container b"></div></div></div><div class="c86-footer"></div></div>';
        this.element = new Element('div', { 'class': 'wgetCalendar', 'html': innerHtml, 'style': 'display: '+ (this.options.alwaysShow ? 'block' : 'none') }).addClass(this.options.theme);
        
        //Add the calender to the document and position it
        if(this.options.injectInsideTarget) this.element.injectBottom(this.target);
        else {
          this.element.injectBottom($(document.body));
          this.position();
          window.addEvent('resize', this.position.bind(this));
        }
        
        //Assign the containers
        this.currentContainer = this.element.getElement('.c86-container.a').setStyle('z-index', 999);
        this.tempContainer = this.element.getElement('.c86-container.b').setStyle('z-index', 998);
        
        //Assign the interface elements and events
        this.header = this.element.getElement('.c86-header');
        this.label = this.header.getElement('.c86-label');
        this.arrowLeft = this.header.getElement('.c86-arrow-left');
        this.arrowRight = this.header.getElement('.c86-arrow-right');
        
        this.label.addEvent('click', this.levelUp.bind(this));
        this.arrowLeft.addEvent('click', this.slideLeft.bind(this));
        this.arrowRight.addEvent('click', this.slideRight.bind(this));
        
        //Create dates ranges
        if($defined(this.options.minDate)) {
          this.options.minDate = Date.parse(this.options.minDate).clearTime();
          if(!this.options.minDate.isValid()) this.options.minDate = null;
        }
        if($defined(this.options.maxDate)) {
          this.options.maxDate = Date.parse(this.options.maxDate).clearTime();
          if(!this.options.maxDate.isValid()) this.options.maxDate = null;
        }
        
        //Parse excluded dates
        if($defined(this.options.excludedDates)) {
          var excludedDates = [];
          this.options.excludedDates.each(function(date) {
            excludedDates.include(this.format(new Date().parse(date).clearTime(), '%t'));
          }.bind(this));
          this.options.excludedDates = excludedDates;
        }
        
        //Make the calendar draggable?
        if(this.options.draggable && !this.options.injectInsideTarget) {
          this.header.addClass('c86-dragger');
          this.label.setStyle('width', 'auto');
          new Drag(this.element, { 'handle': this.header });
        }
        
        //Create hidden input
        if(this.options.createHiddenInput) {
          this.hiddenInput = new Element('input', { 'type': 'hidden', 'name': this.options.hiddenInputName }).injectAfter(this.target);
        }
        
        //Link with the input element
        if(!this.options.disallowUserInput && this.options.linkWithInput && this.target.get('tag') == 'input') {
          this.target.addEvent('keyup', function() {
            this.setDate(this.target.get('value'), false);
          }.bind(this));
        }
        //Or toggler...
        if($defined(this.options.toggler)) this.options.toggler = $(this.options.toggler);
        
        //Add show and hide events
        ($defined(this.options.toggler) ? this.options.toggler : this.target).addEvents({
          'focus': this.show.bind(this), 'click': this.show.bind(this)
        });
        
        if(!this.options.alwaysShow) document.addEvent('mousedown', this.outsideClick.bind(this));
        MooTools.lang.addEvent('langChange', function() { this.render(); this.pick(); }.bind(this));
        
        //Other events
        if(this.target.get('tag') == 'input') {
          this.target.addEvent('keydown', this.onKeyDown.bind(this));
          if(this.options.disallowUserInput) this.target.addEvent('contextmenu', ($lambda(false)));
        }
        
        //See if the date is correct
        this.selectedDate = this.correctDate(this.selectedDate);
        
        //Prefill the current date
        if(this.options.prefill) this.pick();
        
        //Render the default view
        this.viewDate = this.selectedDate.clone().set('date', 1).clearTime();
        this.view = this.options.defaultView;
        this.render();
      },
      
      initialDate: function( date ) {
        date = date.replace(/\//gi,'-').replace(/\./,'-');
        var d = date.split('-');
        return d[2]+"-"+d[1]+"-"+d[0];
      },
      
      render: function() {
        this.currentContainer.empty();
        
        switch(this.view) {
          case 'decade': this.renderDecade(); break;
          case 'year': this.renderYear(); break;
          default: this.renderMonth();
        }
        
        return this;
      },
      
      /* Rendering */
      
      renderMonth: function() {
        this.view = 'month';
        this.currentContainer.empty().addClass('c86-month');
        if(this.options.pickable) this.currentContainer.addClass('c86-pickable');
        
        var lang = MooTools.lang.get('Date'), weekdaysCount = this.viewDate.format('%w') - (this.options.startMonday ? 1 : 0);
        if(weekdaysCount == -1) weekdaysCount = 6;
        
        //Label
        this.label.set('html', lang.months[this.viewDate.get('month')] +' '+ this.viewDate.format('%Y'));
        
        //Day label row
        var row = new Element('div', { 'class': 'c86-row' }).injectBottom(this.currentContainer);
        for(var i = (this.options.startMonday ? 1 : 0); i < (this.options.startMonday ? 8 : 7); i++) {
          var day = new Element('div', { 'html': lang.days[this.options.startMonday && i == 7 ? 0 : i] }).injectBottom(row);
          day.set('html', day.get('html').substr(0, 2));
        }
        
        //Add days for the beginning non-month days
        row = new Element('div', { 'class': 'c86-row' }).injectBottom(this.currentContainer);
        y = this.viewDate.clone().decrement('month').getLastDayOfMonth();
        for(var i = 0; i < weekdaysCount; i++) {
          this.injectDay(row, this.viewDate.clone().decrement('month').set('date', y - (weekdaysCount - i) + 1), true);
        }
        
        //Add month days
        for(var i = 1; i <= this.viewDate.getLastDayOfMonth(); i++) {
          this.injectDay(row, this.viewDate.clone().set('date', i));
          if(row.getChildren().length == 7) {
            row = new Element('div', { 'class': 'c86-row' }).injectBottom(this.currentContainer);
          }
        }
        
        //Add outside days
        var y = 8 - row.getChildren().length, startDate = this.viewDate.clone().increment('month').set('date', 1);
        for(var i = 1; i < y; i++) {
          this.injectDay(row, startDate.clone().set('date', i), true);
        }
        
        //Always have six rows
        for(var y = this.currentContainer.getElements('.c86-row').length; y < 7; y++) {
          row = new Element('div', { 'class': 'c86-row' }).injectBottom(this.currentContainer);
          for(var z = 0; z < 7; z++) {
            this.injectDay(row, startDate.clone().set('date', i), true);
            i++;
          }
        }
        
        this.renderAfter();
      },
      
      //Used by renderMonth
      injectDay: function(row, date, outside) {
        var day = new Element('div', { 'html': date.get('date') }).injectBottom(row);
        day.store('date', date);
        if(outside) day.addClass('c86-outside');
        
        if(($defined(this.options.minDate) && this.format(this.options.minDate, '%t') > this.format(date, '%t')) || 
           ($defined(this.options.maxDate) && this.format(this.options.maxDate, '%t') < this.format(date, '%t')) ||
           ($defined(this.options.excludedWeekdays) && this.options.excludedWeekdays.contains(date.format('%w').toInt())) ||
           ($defined(this.options.excludedDates) && this.options.excludedDates.contains(this.format(date, '%t'))))
          day.addClass('c86-non-selectable');
        else if(this.options.pickable) day.addEvent('click', this.pick.bind(this));
        
        if(date.format('%x') == this.today.format('%x')) day.addClass('c86-today');
        if(date.format('%x') == this.selectedDate.format('%x')) day.addClass('c86-selected');
        this.checkDay(day);
      },  
      
      checkDay: function(day) {
        this.options.events.each(function(el){
          if( el[0] != day.retrieve('date').format('%Y-%m-%d') ) return;
          day.set('title',( day.get('title') ? day.get('title') : "") + "<p><a href='"+ el[2] +"'>" + el[1] + "</a></p>").addClass('eventDay');
          if( $defined(el[3]) && !day.get('eventClass') ) day.addClass(el[3]).set('eventClass',el[3]);
        });
      },
      
      renderYear: function() {
        this.view = 'year';
        this.currentContainer.addClass('c86-year-decade');
        var lang = MooTools.lang.get('Date').months;
        
        //Label
        this.label.set('html', this.viewDate.format('%Y'));
        
        var row = new Element('div', { 'class': 'c86-row' }).injectBottom(this.currentContainer);
        for(var i = 1; i < 13; i++) {
          var month = new Element('div', { 'html': lang[i - 1] }).injectBottom(row);
          month.set('html', month.get('html').substr(0, 3)); //Setting and getting the innerHTML takes care of html entity problems (e.g. [M&a]uml;r => [Mär]z)
          var iMonth = this.viewDate.clone().set('month', i - 1);
          month.store('date', iMonth);
          
          if(($defined(this.options.minDate) && this.format(this.options.minDate.clone().set('date', 1), '%t') > this.format(iMonth, '%t')) ||
             ($defined(this.options.maxDate) && this.format(this.options.maxDate.clone().set('date', 1), '%t') < this.format(iMonth, '%t')))
            month.addClass('c86-non-selectable');
          else month.addEvent('click', this.levelDown.bind(this));
          
          if(i - 1 == this.today.get('month') && this.viewDate.get('year') == this.today.get('year')) month.addClass('c86-today');
          if(i - 1 == this.selectedDate.get('month') && this.viewDate.get('year') == this.selectedDate.get('year')) month.addClass('c86-selected');
          if(!(i % 4) && i != 12) row = new Element('div', { 'class': 'c86-row' }).injectBottom(this.currentContainer);
        }
        
        this.renderAfter();
      },
      
      renderDecade: function() {
        this.label.removeClass('c86-clickable');
        this.view = 'decade';
        this.currentContainer.addClass('c86-year-decade');
        
        var viewYear, startYear;
        viewYear = startYear = this.viewDate.format('%Y').toInt();
        while(startYear % 12) startYear--;
        
        //Label
        this.label.set('html', startYear +' &#150; '+ (startYear + 11));
        
        var row = new Element('div', { 'class': 'c86-row' }).injectBottom(this.currentContainer);
        for(var i = startYear; i < startYear + 12; i++) {
          var year = new Element('div', { 'html': i }).injectBottom(row);
          var iYear = this.viewDate.clone().set('year', i);
          year.store('date', iYear);
          
          if(($defined(this.options.minDate) && this.options.minDate.get('year') > i) ||
             ($defined(this.options.maxDate) && this.options.maxDate.get('year') < i)) year.addClass('c86-non-selectable');
          else year.addEvent('click', this.levelDown.bind(this));
          
          if(i == this.today.get('year')) year.addClass('c86-today');
          if(i == this.selectedDate.get('year')) year.addClass('c86-selected');
          if(!((i + 1) % 4) && i != startYear + 11) row = new Element('div', { 'class': 'c86-row' }).injectBottom(this.currentContainer);
        }
        
        this.renderAfter();
      },
      
      renderAfter: function() {
        //Iterate rows and add classes and remove navigation if nessesary
        var rows = this.currentContainer.getElements('.c86-row');
        
        for(var i = 0; i < rows.length; i++) {
          rows[i].set('class', 'c86-row '+ ['a', 'b', 'c', 'd', 'e', 'f', 'g'][i] +' '+ (i % 2 ? 'c86-even' : 'c86-odd')).getFirst().addClass('c86-first');
          rows[i].getLast().addClass('c86-last');
          
          if( (this.view == 'month' && i == 1 && $defined(this.options.minDate) && this.options.minDate.diff(this.viewDate) <= 0) ||
            (this.view != 'month' && i == 0 && $defined(this.options.minDate) && this.format(this.options.minDate, '%t') >= this.format(rows[i].getFirst().retrieve('date'), '%t')) )
            this.arrowLeft.setStyle('visibility', 'hidden');
          
          if(i == rows.length - 1 && $defined(this.options.maxDate)) {
            if((this.view == 'month' && this.options.maxDate.diff(this.viewDate.clone().increment('month').decrement()) >= 0) ||
               (this.view == 'year' &&  this.format(this.options.maxDate, '%t') <= this.format(rows[i].getLast().retrieve('date').clone().increment('month'), '%t')) ||
               (this.view == 'decade' && this.format(this.options.maxDate, '%t') <= this.format(rows[i].getLast().retrieve('date').clone().increment('year'), '%t')))
              this.arrowRight.setStyle('visibility', 'hidden');
          }
        };
        
        if($defined(this['render'+ this.view])) {
          var elements = this.currentContainer.getElements('div[class~=c86-row] > div');
          if(this.view == 'month') {
            for(var i = 0; i < 7; i++) elements[i] = null;
            elements = elements.clean();
          }
          this.fireEvent('render'+ this.view, { 'view': this.view, 'elements': elements });
        }
        
        var fkn = function(tip,hovered){
          if( tip.get('state') == 'active') 
            return fkn.delay(1000, null, [tip,hovered]);
          tip.setStyle('display', 'none');
        };        
        new Tips(this.currentContainer.getElements('div[class~=c86-row] > div.eventDay'), {
          offset: {x: -5, y: -40},
          className : 'tooltipElement eventDay',
          onShow: function(tip, hovered){ 
            tip.set('class','tooltipElement eventDay');
            if(hovered.get('eventClass') ) tip.addClass(hovered.get('eventClass')); 
            tip.setStyle('display', 'block'); 
            tip.removeEvents('mousemove');
            tip.removeEvents('mouseleave');
            tip.addEvents({
              'mousemove':function(){
                tip.set('state', 'active');
              },
              'mouseleave':function(){
                tip.set('state', ''); 
                fkn.delay(1000, null, [tip,hovered]);
              }
            });
            tip.set('state', 'active'); 
          },
          onHide: function(tip, hovered){
            tip.set('state', ''); 
            fkn.delay(1000, null, [tip,hovered]); 
          },
          fixed : true
        });
        
      },
      
      /* Animations */
      
      slideLeft: function() {
        this.switchContainers();
        
        //Render new view
        switch(this.view) {
          case 'month':  this.viewDate.decrement('month'); break;
          case 'year':   this.viewDate.decrement('year'); break;
          case 'decade': this.viewDate.set('year', this.viewDate.get('year') - 12); break;
        }
        this.render();
        
        //Tween the new view in and old view out
        this.currentContainer.setStyle('visibility','visible');
        this.currentContainer.set('tween', { 'duration': this.options.slideDuration, 'transition': this.options.slideTransition }).tween('left', [-this.currentContainer.getWidth(), 0]);
        this.tempContainer.set('tween', { 'duration': this.options.slideDuration, 'transition': this.options.slideTransition }).tween('left', [0, this.tempContainer.getWidth()]);
      },
      
      slideRight: function() {
        this.switchContainers();
        
        //Render new view
        switch(this.view) {
          case 'month': this.viewDate.increment('month'); break;
          case 'year': this.viewDate.increment('year'); break;
          case 'decade': this.viewDate.set('year', this.viewDate.get('year') + 12); break;
        }
        this.render();
        
        //Tween the new view in and old view out
        this.currentContainer.setStyle('visibility','visible');
        this.currentContainer.set('tween', { 'duration': this.options.slideDuration, 'transition': this.options.slideTransition }).tween('left', [this.currentContainer.getWidth(), 0]);
        this.tempContainer.set('tween', { 'duration': this.options.slideDuration, 'transition': this.options.slideTransition }).tween('left', [0, -this.currentContainer.getWidth()]);
      },
      
      levelDown: function(e) {
        if(this.transitioning) return;
        this.switchContainers();
        this.viewDate = $(e.target).retrieve('date');
        
        //Render new view
        switch(this.view) {
          case 'year': this.renderMonth(); break;
          case 'decade': this.renderYear(); break;
        }
        
        //Tween the new view in and old view out
        this.transitioning = true;
        this.currentContainer.set('tween', { 'duration': this.options.fadeDuration, 'transition': this.options.fadeTransition, 
                           'onComplete': function() { this.transitioning = false }.bind(this) }).setStyles({'opacity': 0, 'left': 0}).fade('in');
        this.tempContainer.set('tween', { 'duration': this.options.fadeDuration, 'transition': this.options.fadeTransition }).fade('out');
      },
      
      levelUp: function() {
        if(this.view == 'decade' || this.transitioning) return;
        this.switchContainers();
        
        //Set viewdates and render
        switch(this.view) {
          case 'month': this.renderYear(); break;
          case 'year':  this.renderDecade(); break;
        }
        
        //Tween the new view in and old view out
        this.transitioning = true;
        this.currentContainer.set('tween', { 'duration': this.options.fadeDuration, 'transition': this.options.fadeTransition, 
                           'onComplete': function() { this.transitioning = false }.bind(this) }).setStyles({'opacity': 0, 'left': 0}).fade('in');
        this.tempContainer.set('tween', { 'duration': this.options.fadeDuration, 'transition': this.options.fadeTransition }).fade('out');
      },
      
      switchContainers: function() {
        this.currentContainer = this.currentContainer.hasClass('a') ? this.element.getElement('.c86-container.b') : this.element.getElement('.c86-container.a');
        this.tempContainer = this.tempContainer.hasClass('a') ? this.element.getElement('.c86-container.b') : this.element.getElement('.c86-container.a');
        this.currentContainer.empty().removeClass('c86-month').removeClass('c86-year-decade').setStyles({ 'opacity': 1, 'display': 'block', 'z-index': 999 });
        this.tempContainer.setStyle('z-index', 998);
        
        this.label.addClass('c86-clickable');
        this.arrowLeft.setStyle('visibility', 'visible');
        this.arrowRight.setStyle('visibility', 'visible');
      },
      
      /* Positioning and visibility */
      
      position: function() {
        var top, left;
        var coordinates = this.target.getCoordinates();
        
        switch(this.options.alignX) {
          case 'left':
            left = coordinates.left;
            break;
          case 'middle':
            left = coordinates.left + (coordinates.width / 2) - (this.element.getWidth() / 2);
            break;
          case 'right': default:
            left = coordinates.left + coordinates.width;
        }
        
        switch(this.options.alignY) {
          case 'bottom':
            top = coordinates.top + coordinates.height;
            break;
          case 'top':
            top = coordinates.top - this.element.getHeight();
            break;
          case 'ceiling': default:
            top = coordinates.top;
        }
        
        left += this.options.offsetX.toInt();
        top += this.options.offsetY.toInt();
        
        this.element.setStyles({ 'top': top, 'left': left });
      },
      
      show: function() {
        if( !this.options.alwaysShow) {
          this.visible = true;
          /*if(!Browser.Engine.trident) {
            this.element.setStyles({ 'opacity': 0, 'display': 'block' });
            if(!this.options.injectInsideTarget) this.position();
            this.element.set('tween', { 'duration': this.options.toggleDuration, 'transition': this.options.fadeTransition }).fade('in');
          }  else {*/
            this.element.setStyles({ 'opacity': 1, 'visibility': 'visible', 'display': 'block' });
            if(!this.options.injectInsideTarget) this.position();
          //}
        }
      },
      
      hide: function() {
        if(this.visible & !this.options.alwaysShow) {
          this.visible = false;
          /*if(!Browser.Engine.trident) {
            this.element.set('tween', { 'duration': this.options.toggleDuration, 'transition': this.options.fadeTransition,
                          'onComplete': function() { this.element.setStyle('display', 'none') }.bind(this) }).fade('out');
          } else*/ this.element.setStyle('display', 'none');
        }
      },
      
      toggle: function() {
        if(this.visible) this.hide();
        else this.show();
      },
      
      outsideClick: function(e) {
        if(this.visible) {
          var elementCoords = this.element.getCoordinates();
          var targetCoords  = this.target.getCoordinates();
          if(((e.page.x < elementCoords.left || e.page.x > (elementCoords.left + elementCoords.width)) ||
              (e.page.y < elementCoords.top || e.page.y > (elementCoords.top + elementCoords.height))) &&
             ((e.page.x < targetCoords.left || e.page.x > (targetCoords.left + targetCoords.width)) ||
              (e.page.y < targetCoords.top || e.page.y > (targetCoords.top + targetCoords.height))) ) this.hide();
        }
      },
      
      /* Formating and picking */
      
      pick: function(e) {
        if($defined(e)) {
          this.selectedDate = $(e.target).retrieve('date');
          this.element.getElements('.c86-selected').removeClass('c86-selected');
          $(e.target).addClass('c86-selected');
          
          (this.hide.bind(this)).delay(150);
          
          //If outside day, set viewdate and render
          if($(e.target).hasClass('c86-outside')) {
            if(this.options.alwaysShow) {
              if(this.selectedDate.diff(this.viewDate) > 0) this.slideLeft();
              else this.slideRight();
            } else {
              this.viewDate = this.selectedDate.clone().set('date', 1);
              (this.render.bind(this)).delay(300);
            }
          }
        }
        
        var value = this.format(this.selectedDate);
        
        if(!this.options.injectInsideTarget) {
          switch(this.target.get('tag')) {
            case 'input': this.target.set('value', value); break;
            default: this.target.set('html', value);
          }
        }
        
        if($defined(this.hiddenInput)) this.hiddenInput.set('value', this.format(this.selectedDate, this.options.hiddenInputFormat));
        this.fireEvent('change', this.selectedDate);
        
        return this;
      },
      
      //Extended format parser
      format: function(date, format) {
        if(!$defined(format)) format = this.options.format;
        if(!$defined(date)) return;
        format = format.replace(/%([a-z%])/gi,
          function($1, $2) {
            switch($2) {
              case 'D': return date.get('date');
              case 'n': return date.get('mo') + 1;
              case 't': return (date.getTime() / 1000).toInt();
            }
            return '%'+ $2;
          }
        );
        return date.format(format);
      },
      
      onKeyDown: function(e) {
        if(this.options.keyNavigation) {
          var newDate = this.selectedDate.clone();
          var right = true;
          var pressed = false;
          
          switch(e.code) {
            //Left
            case 37: newDate.decrement(); pressed = true; right = false; break;
            //Right
            case 39: newDate.increment(); pressed = true; break;
            //Up
            case 38: newDate.decrement('month'); pressed = true; right = false; break;
            //Down
            case 40: newDate.increment('month'); pressed = true; break;
          }
          
          if(pressed) {
            //Correct it
            newDate = this.correctDate(newDate, right);
            
            //If different, set it
            if(this.selectedDate.diff(newDate) != 0) this.setDate(newDate);
          }
        }
        if(this.options.disallowUserInput) return false;
      },
      
      //Checks if the date is an excluded date, excluded weekday or isn't within the range
      //If so it returns a correct pickable date
      correctDate: function(date, right) {
        if(!$defined(right)) right = true;
        
        //Check if the date is lower than the minimal date
        if($defined(this.options.minDate) && date.diff(this.options.minDate) > 0) date = this.options.minDate.clone();
        //Check if the date is higher than the maximum date
        else if($defined(this.options.maxDate) && date.diff(this.options.maxDate) < 0) date = this.options.maxDate.clone();
        
        //Check if the currect picked weekday is allowed
        var i = 0;
        while( ($defined(this.options.excludedWeekdays) && this.options.excludedWeekdays.contains(date.format('%w').toInt())) ||
             ( ($defined(this.options.minDate) && date.diff(this.options.minDate) > 0) ||
             ($defined(this.options.maxDate) && date.diff(this.options.maxDate) < 0) ) ||
             ($defined(this.options.excludedDates) && this.options.excludedDates.contains(this.format(date, '%t'))) ) {
          if(i == 31) right = !right; //Reverse
          else if(i == 62) {
            date = this.options.minDate.clone();
            break; //Stop a possible infinitive loop
          }
          
          if(right) date.increment();
          else date.decrement();
          i++;
        }
        
        return date;
      },
      
      setDate: function(value, pick) {
        if(!$defined(pick)) pick = true;
        
        if($type(value) == 'date') {
          var date = value.clearTime();
        } else {
          var date = $chk(value) ? new Date().parse(this.target.get('value')).clearTime() : new Date().clearTime();
        }
        
        if(date.isValid()) {
          this.selectedDate = this.correctDate(date);
          this.viewDate = this.selectedDate.clone().set('date', 1);
          this.render();
          if(pick) this.pick();
        }
        
        return this;
      },
      
      getDate: function() {
        return this.selectedDate;
      }
      
    }),
    
    Slider : new Class({

      Implements: [Events, Options],
      
      numNav: new Array(),
      timer: null,
      isSliding: 0,
      direction: 1,

      options: {
        slideTimer: 8000,  
        orientation: 'horizontal',      
        fade: false,                    
        isPaused: false,
        transitionTime: 1100, 
        transitionType: 'cubic:out',
        container: null,
        items:  null, 
        itemNum: 0,
        numNavActive: false,
        numNavHolder: null,
        playBtn: null,
        prevBtn: null,
        nextBtn: null,
        changeElement: null
      },

      initialize: function(options) {
        var self = this;
        this.setOptions(options);
        self.options.container.setStyle('overflow', "hidden");  
        if(self.options.playBtn != null) {
          //self.pauseIt();  
          self.options.playBtn.set('text', 'pause');        
          self.options.playBtn.addEvents({
            'click': function() {
              self.pauseIt();
            },
            'mouseenter' : function() {
              this.setStyle('cursor', 'pointer');
            },
            'mouseleave' : function() {}
          });
        }
        if(self.options.prevBtn && self.options.nextBtn){        
          self.options.prevBtn.addEvents({ 
            'click' : function() {
              if(self.isSliding == 0){
                if(self.options.isPaused == false){
                  clearInterval(self.timer);
                  self.timer = self.slideIt.periodical(self.options.slideTimer, self, null);
                }
                self.direction = 0;
                self.slideIt();
              }
            },
            'mouseenter' : function() {
              this.setStyle('cursor', 'pointer');
            },
            'mouseleave' : function() {}
          });	        
          this.options.nextBtn.addEvents({ 
            'click' : function() {
              if(self.isSliding == 0){
                if(self.options.isPaused == false){
                  clearInterval(self.timer);
                  self.timer = self.slideIt.periodical(self.options.slideTimer, self, null);
                }
                self.direction = 1;
                self.slideIt();
              }
            },
            'mouseenter' : function() {
              this.setStyle('cursor', 'pointer');
            },
            'mouseleave' : function() {}
          });
        }      
        self.options.items.each(function(el, i){
          el.setStyle('position', "absolute");
          var itemH = el.getSize().y;
          var itemW = el.getSize().x;
          if(self.options.orientation == 'vertical'){ 
            el.setStyle('top', (-1 * itemH));
            el.setStyle('left', 0);
          }else if(self.options.orientation == 'none') {
            el.setStyle('left', 0);
            el.setStyle('top', 0);
            el.set('opacity', 0);
          }else{
            el.setStyle('left', (-1 * itemW));
          }
          if(self.options.numNavActive == true){
            var numItem = new Element('li', {id: 'num'+i});
            var numLink = new Element('a', {
              'class': 'numbtn',
              'html': (i+1)
            });
            numItem.adopt(numLink);
            self.options.numNavHolder.adopt(numItem);
            self.numNav.push(numLink);
            numLink.set('morph', {duration: 100, transition: Fx.Transitions.linear, link: 'ignore'});          
            numLink.addEvents({
              'click' : function(){
                self.numPress(i);
              },
              'mouseenter' : function() {
                this.setStyle('cursor', 'pointer');
              }
            });
            if(i == self.options.itemNum){
              var initNum = self.numNav[i];
              initNum.addClass('active');
            }
          }      
        });
      },

      start: function() {      
        var self = this;
        self.slideIt(self.options.itemNum);
        if(self.options.isPaused == false){
          self.timer = self.slideIt.periodical(self.options.slideTimer, self, null);
          if(self.options.playBtn) self.options.playBtn.set('text', 'pause');
        }
        else{
          //self.pauseIt();
          if(self.options.playBtn) self.options.playBtn.set('text', 'play');
        }      
      },    
      
      slideIt: function(passedID) {
        var self = this, transition = true;
        var curItem = self.options.items[self.options.itemNum]; 
        if(self.options.numNavActive == true)
          var curNumItem =  self.numNav[self.options.itemNum];
        if(passedID != null) {
          if(self.options.itemNum != passedID){
            if(self.options.itemNum > passedID) { 
              self.direction = 0; 
            } else { 
              self.direction = 1;
            }
            self.options.itemNum = passedID;
          } else {
            transition = false;
          }
        } else {
          self.changeIndex();
        }
        this.fireEvent('changeIndex', [self.options.itemNum]);
        var newItem = self.options.items[self.options.itemNum];
        var newOpacity = 0;        
        if(self.direction == 0){
          var curX = self.options.container.getSize().x;
          var newX = (-1 * newItem.getSize().x);
          var curY = self.options.container.getSize().y;
          var newY = (-1 * newItem.getSize().y);
        } else {
          var curX = (-1 * self.options.container.getSize().x);
          var newX = newItem.getSize().x;
          var curY = (-1 * self.options.container.getSize().y);
          var newY = newItem.getSize().y;
        }
        
        if( !transition )
        {
          newOpacity = 1;
          newX = newY = 0;
        }

        if(self.options.numNavActive == true){
          var newNumItem =  self.numNav[self.options.itemNum];
          newNumItem.addClass('active');
        }
        var item_in = new Fx.Morph(newItem, {
          duration: self.options.transitionTime, 
          transition: self.options.transitionType,
          link: 'ignore',
          onStart: function(){
            self.isSliding = 1;
          },
          onComplete: function(){
            self.isSliding = 0;
          }           
        });
        if(self.options.orientation == 'vertical'){
          if(self.options.fade == true){
            item_in.start({'opacity':[newOpacity,1],'top' : [newY, 0]});
          } else {
            item_in.start({'top' : [newY, 0]});
          }
        }else if(self.options.orientation == 'none') {
          item_in.start({'opacity':[newOpacity,1]});
        } else {
          if(self.options.fade == true){
            item_in.start({'opacity':[newOpacity,1],'left' : [newX, 0]});
          } else {
            item_in.start({'left' : [newX, 0]});
          }
        }
        if(curItem != newItem){
          var item_out = new Fx.Morph(curItem, {
            duration: self.options.transitionTime, 
            transition: self.options.transitionType,
            link: 'ignore'
          });        
          if(self.options.numNavActive == true){
            curNumItem.removeClass('active');
          }        
          if(self.options.orientation == 'vertical'){
            if(self.options.fade == true){
              item_out.start({'opacity':[-.4],'top' : [(curY)]});
            } else {
              item_out.start({'top' : [(curY)]});
            }
          }else if(self.options.orientation == 'none') {
            item_out.start({'opacity':[1,-.4]});
          }else{
            if(self.options.fade == true){
              item_out.start({'opacity':[-.4],'left' : [(curX)]});
            } else {
            item_out.start({'left' : [(curX)]});
            }
          }
        }      
      },
      
      pauseIt: function () {
        var self = this;
        if(self.isSliding == 0){
          if(self.options.isPaused == false){
            self.options.isPaused = true;
            clearInterval(self.timer);
            self.options.playBtn.set('text', 'play');
          } else {
            self.options.isPaused = false;
            self.slideIt();
            self.timer = self.slideIt.periodical(self.options.slideTimer, this, null); 
            self.options.playBtn.set('text', 'pause');
          }
        }
      },
      
      changeIndex: function() {
        var self = this; 
        var numItems = self.options.items.length;
        if(self.direction == 1){
          if(self.options.itemNum < (numItems - 1)){
            self.options.itemNum++; 
          } else {
            self.options.itemNum = 0;
          }
        } else if(self.direction == 0){
          if(self.options.itemNum > 0){
            self.options.itemNum--; 
          } else {
            self.options.itemNum = (numItems - 1);
          }
        }	      
      },
      
      numPress: function (theIndex) {
        var self = this;      
        if((self.isSliding == 0) && (self.options.itemNum != theIndex)){
          if(self.options.isPaused == false){
            clearInterval(self.timer);
            self.timer = self.slideIt.periodical(self.options.slideTimer, this, null);
          }
          self.slideIt(theIndex);
        }
      }   

    }),

    clearSelection : function() {
      if( document.selection )
        document.selection.empty();
      else if( window.getSelection )
        window.getSelection().removeAllRanges();
    },
    
    redirect: function(url) {
      return window.location.href = url;
    },
    
    getURI: function() {
      if( window.history == undefined || window.history.pushState == undefined )
        return AppURL + window.location.hash.replace('#!','');
      return window.location.href;
    },
    
    destroyGarbage: function() {
      $$('.appBlockUI').each(function(el){
        if(!$defined(el.appUI) || !$defined($(el.appUI)))
          el.destroy();
      });
      $$(['.garbage','.tooltipElement']).each(function(el){
        if($defined(el.dispose))
          el.dispose(300);
      });
    },

    changeURI: function(url) {
      App.Helper.destroyGarbage();
      if( !App.Config.changeURI )
        return;
      if( window.history == undefined || window.history.pushState == undefined )
      {
        return window.location.hash = '!' + url.replace(AppURL,'');
      }
      return window.history.pushState({}, "", url);
    },
    
    popState : function(){
      if( App.Config.State <= 1 )
      {
        App.Config.State = 2;
        return false;
      }
      App.Config.ActiveFn = null;
      if( App.Config.PreviousFn.length )
      {
        console.log(App.Config.PreviousFn);
        var p = App.Config.PreviousFn.pop();
        if( p != null && p.fn != null)
        return p.fn();
      }
      if( window.location.hash == '#' || window.location.href.substr(-1) == '#')
        return false;
      App.Module.Load(window.location.href, 1, $('content'));
    },
    
    checkURI: function(){
      if( !App.Config.State )
      {
        window.onhashchange = function(){
          if( App.Config.HashState ) return false;
          App.Config.State = 2;
          App.Helper.popState();
        }     
        window.onpopstate = App.Helper.popState;
      }
      App.Config.State = 1;
      if( !( window.history == undefined || window.history.pushState == undefined ) || window.location.hash.substr(0, 2) != '#!')
        return;
      App.Helper.redirect(AppURL + window.location.hash.substr(2) + '#!' + window.location.hash.substr(2) );
    },

    dataFromForm: function(frm) {
      var hash = new Hash();
      frm.getElements('.post').each(function(el){hash.set(el.get('name'), el.get('value'))});
      frm.getElements('.postChk').each(function(el){hash.set(el.get('name'), el.get('checked') ? 1 : 0 )});
      frm.getElements('.postRadio').each(function(el){ if( el.get('checked') ) hash.set(el.get('name'),  el.get('value') )});
      return hash;
    },
    
    addResize: function(event, domready, exec){
      window.addEvent('resize', event);  
      window.addEvent('scroll', event);  
      if($defined(domready))
        window.addEvent('domready', event);  
      if($defined(exec))
        event();
    },
    
    blockUI: function(el,fn) {
      var appBlockUI = new Element('div', {
        'id': 'appBlockUI' + String.uniqueID(),
        'class':'appBlockUI'
      }).inject(el,'after');    
      appBlockUI.appUI = el; 
      var kn = function(){ appBlockUI.setStyles(el.getCoordinates(el.getParent())); }
      if( $defined(fn) )
        kn = fn.pass([appBlockUI,el]);
      App.Helper.addResize(kn,null,true);      
      el.set('block-id', appBlockUI.get('id'));
    },
    
    unblockUI: function(el) {
      App.Helper.destroyGarbage();
      if( !$defined(el) )
        return;
      $$('#' + el.get('block-id')).destroy();
    },
    
    changeAppClass: function(section) {
      var data = $('app').get('data-class');
      $('app').removeClass(data);
      $('app').set('data-class', section);
      $('app').addClass(section);
    },
    
    generateErrorInput: function(el, classNew){
      if( !$defined(classNew) )
        classNew = '.errorInputFocus';
      el.morph('.errorInput');
      el.addEvent('focus', function(){
        this.morph(classNew);    
      });
      el.addEvent('remove-error', function(){
        this.morph(classNew);    
      });
    }
    
  },
  
  Module : {
  
    LinkElements: function() {},
    
    CreateTips: function(nameClass) {     
      nameClass = $defined(nameClass) ? nameClass : 'tooltipElementDOM';
      new Tips($$('.' + nameClass),  {
        onShow: function(tip, el){
          tip.setStyle('opacity',1);
        },
        onHide: function(tip, el){
          tip.setStyle('opacity',0);
          (function(){tip.setStyles({'top':0,'left':0})}).delay(500);
        },
        'className': 'tooltipElement opacity'
      });
      $$('.' + nameClass).removeClass(nameClass);
    },
    
    SetActive: function( module ) {
      $$('.appModule.active').removeClass('active');
      $$('.appModule.' + module ).addClass('active');
    },
    
    Load: function(url, level, where) {
      if( where.appfx == undefined )
        where.appfx = new Fx.Morph(where, {
            link: 'cancel',
            duration: 350
        });
      $$('.appBlockUI').addClass('garbage');
      App.Helper.blockUI(where);
      $$('.app-menu li.active').removeClass('active');
      $$('.app-menu li a').each(function(el){
        if( el.get('href') == url ) el.getParent().addClass('active');
      });      
      where.appfx.start({'opacity':.2});
      if( where.appReq != undefined && where.appReq.isRunning() )
        where.appReq.cancel();
      if( App.Config.ActiveFn != null)
        App.Config.PreviousFn.push(App.Config.ActiveFn);
      App.Config.ActiveFn = { fn:  App.Module.Load.pass([url,level,where]), url : url };
      where.appReq = new Request.HTML({
        evalScripts: false,
        link: 'cancel',
        url: url,
        onSuccess : function(x1, x2, html, js){
          where.appfx.start({'opacity':0});
          where.setStyle('min-height', where.getSize().y);
          where.setStyle('max-height', where.getSize().y);
          var kf = function(){
            where.set('html', html);
            eval(js);
            App.Helper.unblockUI(where);
            App.Module.LinkElements();
            App.Config.HashState = true;
            App.Helper.changeURI(url);
            (function(){App.Config.HashState = false; where.setStyle('max-height','none');}).delay(400);
            where.appfx.start({'opacity':1,'min-height':0,'max-height': where.getScrollSize().y});
          }
          kf.delay(400);
        }
      }).post({level:level});
    },
    
    LoadCustom: function(url, level, where) {
      if( where.appfx == undefined )
        where.appfx = new Fx.Morph(where, {
            link: 'cancel',
            duration: 350
        });
      $$('.appBlockUI').addClass('garbage');
      App.Helper.blockUI(where);
      $$('.app-menu li.active').removeClass('active');
      $$('.app-menu li a').each(function(el){
        if( el.get('href') == url ) el.getParent().addClass('active');
      });      
      where.appfx.start({'opacity':.2});
      if( where.appReq != undefined && where.appReq.isRunning() )
        where.appReq.cancel();
      if( App.Config.ActiveFn != null)
        App.Config.PreviousFn.push(App.Config.ActiveFn);
      App.Config.ActiveFn = { fn:  App.Module.Load.pass([url,level,where]), url : url };
      where.appReq = new Request.HTML({
        evalScripts: false,
        link: 'cancel',
        url: url,
        onSuccess : function(x1, x2, html, js){
          where.appfx.start({'opacity':0});
          /*where.setStyle('min-height', where.getSize().y);
          where.setStyle('max-height', where.getSize().y);*/
          var kf = function(){
            where.set('html', html);
            eval(js);
            App.Helper.unblockUI(where);
            App.Module.LinkElements();
            App.Config.HashState = true;
            App.Helper.changeURI(url);
            (function(){App.Config.HashState = false; /*where.setStyle('max-height','none');*/}).delay(400);
            where.appfx.start({'opacity':1});
          }
          kf.delay(400);
        }
      }).post({level:level});
    }
    
  }
  
});

/*
---
name: XtLightbox

description: extendable lightbox Base

license: MIT-style

authors:
- Anton Suprun <kpobococ@gmail.com>

requires: [Core/1.3:Class.Extras, Core/1.3:Element]

provides: [XtLightbox]

...
*/

(function($){
var XtLightbox = this.XtLightbox = new Class({

	Implements: [Options, Events],

	options: {
		// onAttach: function(element){},
		// onDetach: function(element){},
		// onShow: function(element){},
		// onHide: function(){},
		// onNext: function(element){},
		// onPrevious: function(element){},
		// onClear: function(){},
		// onDestroy: function(){},
		adaptors: ['Image'],
		adaptorOptions: {},
		renderer: 'Lightbox',
		rendererOptions: {},
		preload: false,
		incrementalPreLoad: 3,
		loop: false,
		closeKeys: ['esc'],
		nextKeys: ['right', 'space'],
		prevKeys: ['left']
	},

	initialize: function(elements, options){
		this.setOptions(options);
		this.loadAdaptors();
		this.loadRenderer();
		var self = this;
		this.onElementClick = function(e){
			e.preventDefault();
			self.show(this);
		};
		$(document).addEvents({
			'keydown': function(e){
                if (self.shown){
                    if (self.options.closeKeys.contains(e.key)){
                        e.stop();
                        self.hide();
                    } else if (self.options.prevKeys.contains(e.key)){
                        e.stop();
                        self.previous();
                    } else if (self.options.nextKeys.contains(e.key)){
                        e.stop();
                        self.next();
                    }
                }
            },
			'keypress': function(e){
                if (!self.shown) return;
                // This stops browser default actions for bound keys
                if (self.options.closeKeys.contains(e.key)) e.stop();
                else if (self.options.prevKeys.contains(e.key)) e.stop();
                else if (self.options.nextKeys.contains(e.key)) e.stop();
            }
		});
		this.attach(elements);
	},

	loadAdaptors: function(){
		if (this.adaptors && this.adaptors.length > 0) return this;
		var adaptors = this.options.adaptors || ['Image'];
		this.adaptors = {};
		var valid = [];
		adaptors.each(function(name){
			if (!XtLightbox.Adaptor[name]) return null;
			var options = {};
			if (this.options.adaptorOptions && this.options.adaptorOptions[name]) options = this.options.adaptorOptions[name];
			var a = new XtLightbox.Adaptor[name](options);
			this.adaptors[name] = a;
			valid.push(a.$name);
		}, this);
		this.options.adaptors = valid;
		return this;
	},

	loadRenderer: function(){
		var name = this.options.renderer;
		if (!name || !XtLightbox.Renderer[name]) name = 'Lightbox';
		this.renderer = new XtLightbox.Renderer[name](this.options.rendererOptions);
		this.renderer.addEvents({
			next: this.next.bind(this),
			previous: this.previous.bind(this),
			close: this.hide.bind(this)
		});
		return this;
	},

	attach: function(elements){
		if (!instanceOf(elements, Elements)) elements = $$(elements);
		var i, l, a, n, e = new Elements;
		elements.each(function(el){
			if (el.$xtlightbox && el.$xtlightbox.adaptor) return null;
			for (i = 0, l = this.options.adaptors.length; i < l; i++){
				n = this.options.adaptors[i];
				a = this.adaptors[n];
				if (a.check(el)){
					el.$xtlightbox = el.$xtlightbox || {};
					el.$xtlightbox.adaptor = a.$name;
					e.push(el);
					el.addEvent('click', this.onElementClick);
					if (this.options.preload) a.load(el);
					break;
				}
			}
		}, this);
		if (e.length == 0) return this;
		if (this.elements) this.elements.append(e);
		else this.elements = e;
		this.fireEvent('attach', e);
		return this;
	},

	detach: function(elements){
		if (!instanceOf(elements, Elements)) elements = $$(elements);
		elements.each(function(el){
			this.elements.erase(el);
			el.removeEvent('click', this.onElementClick);
			delete el.$xtlightbox.adaptor;
		}, this);
		this.fireEvent('detach', elements);
		return this;
	},

	show: function(element){
		if (!element.$xtlightbox || !element.$xtlightbox.adaptor) return this;
		if (this.shown && this.current == element) return this;
		var name = element.$xtlightbox.adaptor;
		if (!this.adaptors[name]) return this;
		this.renderer.show();
		this.renderer.empty();
		var adaptor = this.adaptors[name];
		this.renderer.setLoading(true);
		adaptor.load(element, function(el){
			this.renderer.setLoading(false);
			var o = {
					title: adaptor.getTitle(el),
					total: this.elements.length,
					position: this.elements.indexOf(el) + 1,
					adaptor: element.$xtlightbox.adaptor
				};
			var loop = this.options.loop && o.total > 1;
			if (loop || o.position > 1) o.prev = true;
			if (loop || o.position < o.total) o.next = true;

			// max content size may depend on title size
			var maxSize = this.renderer.getMaxSize(o);
			o.size = adaptor.getSize(el);

			// check if max size is exceeded
			if (maxSize.x < o.size.x){
				o.size.y = Math.round(maxSize.x * o.size.y / o.size.x);
				o.size.x = maxSize.x;
			}
			if (maxSize.y < o.size.y){
				o.size.x = Math.round(o.size.x * maxSize.y / o.size.y);
				o.size.y = maxSize.y;
			}
			adaptor.setSize(el, o.size);
			var c = adaptor.getContent(el);
			this.renderer.render(c, o);

			// at this point we are done loading the image; optionally 'incremenetally' preload
			// note that the incremental preload functionality will preload backwards & forwards

			var a;
			for (a = 0; a < this.options.incrementalPreLoad; a++){
				if (o.position + a < o.total && this.elements[o.position + a]){
					this.adaptors[this.elements[o.position + a].$xtlightbox.adaptor].load(this.elements[o.position + a]);
				}
			}

			for (a = -this.options.incrementalPreLoad; a < 0; a++){
				if (o.position + a < 0 && this.elements[o.total + (o.position + a)]){
					this.adaptors[this.elements[o.total + (o.position + a)].$xtlightbox.adaptor].load(this.elements[o.total + (o.position + a)]);
				} else if (this.elements[o.position + a]) {
					this.adaptors[this.elements[o.position + a].$xtlightbox.adaptor].load(this.elements[o.position + a]);
				}
			}

		}.bind(this));
		this.current = element;
		this.shown = true;
		this.fireEvent('show', element);
		return this;
	},

	hide: function(){
		this.renderer.hide();
		this.current = null;
		this.shown = false;
		this.fireEvent('hide');
		return this;
	},

	next: function(){
		if (!this.elements || this.elements.length == 0) return this;
		if (!this.current) return this.show(this.elements[0]);
		var i = this.elements.indexOf(this.current);
		if (i + 1 == this.elements.length){
			if (this.options.loop) return this.show(this.elements[0]);
			return this;
		}
		this.fireEvent('next', this.elements[i + 1]);
		this.show(this.elements[i + 1]);
		return this;
	},

	previous: function(){
		if (!this.elements || this.elements.length == 0) return this;
		if (!this.current) return this.show(this.elements[0]);
		var i = this.elements.indexOf(this.current);
		if (i == 0){
			if (this.options.loop) return this.show(this.elements.getLast());
			return this;
		}
		this.fireEvent('previous', this.elements[i - 1]);
		this.show(this.elements[i - 1]);
		return this;
	},

	clear: function(){
		if (!this.elements) return this;
		this.elements.each(function(el){
			el.removeEvent('click', this.onElementClick);
			delete el.$xtlightbox.adaptor;
		});
		delete this.elements;
		this.fireEvent('clear');
		return this;
	},

	destroy: function(){
		this.clear();
		for (var i = this.adaptors.length; i--;) this.adaptors[i].destroy();
		this.adaptors.empty();
		this.renderer.destroy();
		delete this.adaptors;
		delete this.renderer;
		$(document).removeEvents({
			'keydown': this.onKeyPress,
			'keypress': this.onKeyPress
		});
		this.fireEvent('destroy');
		return null;
	},

	toElement: function(){
		return this.renderer.toElement();
	}

});
})(document.id);

/*
---
name: XtLightbox.Adaptor

description: extendable lightbox Adaptor base

license: MIT-style

authors:
- Anton Suprun <kpobococ@gmail.com>

requires: [XtLightbox]

provides: [XtLightbox.Adaptor]

...
*/

(function(){

	var Adaptor = this.XtLightbox.Adaptor = new Class({

		Implements: Options,

		$name: '',

		options: {},

		initialize: function(options){
			this.setOptions(options);
		},

		check: function(element){
      return true;
			return element.get('rel').test(/^lightbox/);
		},

		getContent: function(element){
			return '';
		},

		getTitle: function(element){
			return element.get('title');
		},

		getSize: function(element){
			return {x: 0, y: 0};
		},

		setSize: function(element, size){
			return this;
		},

		load: function(element, callback){
			callback(element);
			return this;
		},

		destroy: function(){
			return null;
		}

	});

	var count = 0,
		cache = {};

	Adaptor.cache = function(element, content){
		if (!element.$xtlightbox) throw new Error('Element must be attached to a lightbox');
		var a = element.$xtlightbox.adaptor, i = element.$xtlightbox.id;
		if (!i) i = element.$xtlightbox.id = ++count;
		cache[a + '-' + i] = content;
		return element;
	}

	Adaptor.load = function(element){
		if (!element.$xtlightbox) throw new Error('Element must be attached to a lightbox');
		if (!Adaptor.cached(element)) return null;
		var a = element.$xtlightbox.adaptor, i = element.$xtlightbox.id;
		return cache[a + '-' + i];
	}

	Adaptor.clear = function(element){
		if (!Adaptor.cached(element)) return element;
		var a = element.$xtlightbox.adaptor, i = element.$xtlightbox.id;
		cache[a + '-' + i] = null;
		return element;
	}

	Adaptor.cached = function(element){
		if (!element.$xtlightbox) return false;
		var i = element.$xtlightbox.id, a = element.$xtlightbox.adaptor;
		return i && a && cache[a + '-' + i];
	}

})();

/*
---
name: XtLightbox.Adaptor.Image

description: extendable lightbox Image Adaptor class

license: MIT-style

authors:
- Anton Suprun <kpobococ@gmail.com>

requires: [XtLightbox.Adaptor]

provides: [XtLightbox.Adaptor.Image]

...
*/

XtLightbox.Adaptor.Image = new Class({

	Extends: XtLightbox.Adaptor,

	$name: 'Image',

	options: {
		extensions: ['jpg', 'png', 'gif'],
		lightboxCompat: true
	},

	initialize: function(options){
		this.parent(options);
		var e = this.options.extensions || [];
		if (e.contains('jpg') && !e.contains('jpeg')) e.push('jpeg');
	},

	check: function(element){
		return this.options.lightboxCompat ? this.parent(element) : element.get('href').test('\\.(?:' + this.options.extensions.join('|') + ')$', 'i');
	},

	getContent: function(element){
		if (!XtLightbox.Adaptor.cached(element)) throw new Error('Element content must be loaded first');
		return XtLightbox.Adaptor.load(element);
	},

	getSize: function(element){
		if (!XtLightbox.Adaptor.cached(element)) throw new Error('Element content must be loaded first');
		var img = XtLightbox.Adaptor.load(element);
		return {
			x: img.naturalWidth,
			y: img.naturalHeight
		};
	},

	setSize: function(element, size){
		if (!XtLightbox.Adaptor.cached(element)) throw new Error('Element content must be loaded first');
		var img = XtLightbox.Adaptor.load(element);
		img.set({
			width: size.x,
			height: size.y
		});
		return this;
	},

	load: function(element, callback){
		callback = callback || function(){};
		if (XtLightbox.Adaptor.cached(element)){
			callback(element);
			return this;
		}
		new Element('img').addEvent('load', function(){
			if (!this.naturalWidth) this.naturalWidth = this.width;
			if (!this.naturalHeight) this.naturalHeight = this.height;
			XtLightbox.Adaptor.cache(element, this);
			callback(element);
		}).set({
			src: element.get('href'),
			alt: ''
		});
		return this;
	}
});

/*
---
name: XtLightbox.Adaptor.Vimeo

description: extendable lightbox Vimeo Adaptor class

license: MIT-style

authors:
- Anton Suprun <kpobococ@gmail.com>

requires: [Core/Swiff, XtLightbox.Adaptor]

provides: [XtLightbox.Adaptor.Vimeo]

...
*/

XtLightbox.Adaptor.Vimeo = new Class({

	Extends: XtLightbox.Adaptor,

	$name: 'Vimeo',

	options: {
		width: 800,
		height: 450,
		title: true,
		byline: true,
		portrait: true,
		color: '00adef',
		autoplay: true,
		loop: false,
		iframe: true
	},

	check: function(element){
		var r = /http:\/\/(?:www\.)?vimeo.com\/([0-9]+)(?:\?|$)/i.exec(element.get('href'));
		if (r){
			element.$xtlightbox = element.$xtlightbox || {};
			element.$xtlightbox.VimeoId = r[1];
		}
		return r;
	},

	getContent: function(element){
		if (!XtLightbox.Adaptor.cached(element)) throw new Error('Element content must be loaded first');
		return XtLightbox.Adaptor.load(element);
	},

	getSize: function(element){
		if (!XtLightbox.Adaptor.cached(element)) throw new Error('Element content must be loaded first');
		return {
			x: this.options.width,
			y: this.options.height
		};
	},

	setSize: function(element, size){
		if (!XtLightbox.Adaptor.cached(element)) throw new Error('Element content must be loaded first');
		var obj = document.id(XtLightbox.Adaptor.load(element));
		if (!obj.set){
			obj.width = size.x;
			obj.height = size.y;
		} else obj.set({
			width: size.x,
			height: size.y
		});
		return this;
	},

	load: function(element, callback){
		callback = callback || function(){};
		if (XtLightbox.Adaptor.cached(element)){
			callback(element);
			return this;
		}
		var params = {};
		if (this.options.iframe){
			if (!this.options.title) params.title = '0';
			if (!this.options.byline) params.byline = '0';
			if (!this.options.portrait) params.portrait = '0';
			if (this.options.color && this.options.color != '00adef') params.color = this.options.color;
			if (this.options.autoplay) params.autoplay = '1';
			if (this.options.loop) params.loop = '1';
		} else {
			params.clip_id = element.$xtlightbox.VimeoId;
			params.server = 'vimeo.com';
			params.show_title = this.options.title ? '1' : '0';
			params.show_byline = this.options.byline ? '1' : '0';
			params.show_portrait = this.options.portrait ? '1' : '0';
			params.color = this.options.color || '00adef';
			params.fullscreen = '1';
			params.autoplay = this.options.autoplay ? '1' : '0';
			params.loop = this.options.loop ? '1' : '0';
		}
		var a = [];
		for (var p in params){
			if (!params.hasOwnProperty(p)) continue;
			a.push(p + '=' + params[p]);
		}
		params = a.join('&');
		var obj;
		if (this.options.iframe){
			obj = new Element('iframe', {
				width: this.options.width,
				height: this.options.height,
				src: 'http://player.vimeo.com/video/' + element.$xtlightbox.VimeoId + '?' + params,
				frameborder: 0
			});
		} else {
			obj = new Swiff('http://vimeo.com/moogaloop.swf?' + params, {
				width: this.options.width,
				height: this.options.height,
				params: {
					allowFullScreen: 'true',
					movie: 'http://vimeo.com/moogaloop.swf?' + params,
					wMode: 'transparent',
					bgcolor: '#ff3300'
				}
			});
		}
		XtLightbox.Adaptor.cache(element, obj);
		callback(element);
		return this;
	}
});

/*
---
name: XtLightbox.Adaptor.YouTube

description: extendable lightbox YouTube Adaptor class

license: MIT-style

authors:
- Anton Suprun <kpobococ@gmail.com>

requires: [Core/Swiff, XtLightbox.Adaptor]

provides: [XtLightbox.Adaptor.YouTube]

...
*/

XtLightbox.Adaptor.YouTube = new Class({

	Extends: XtLightbox.Adaptor,

	$name: 'YouTube',

	options: {
		width: 853,
		height: 505,
		hd: true,
		fullscreen: false,
		related: false,
		autoplay: true,
		iframe: false
	},

	check: function(element){
		var l = /http:\/\/(?:www\.)?youtube.com\/watch\?(?:\S+=\S*&)*v=([-a-z0-9_]+)(?:&|$)/i,
		s = /http:\/\/(?:www\.)?youtu.be\/([-a-z0-9_]+)$/i;
		var r = l.exec(element.get('href'));
		if (!r) r = s.exec(element.get('href'));
		if (r){
			element.$xtlightbox = element.$xtlightbox || {};
			element.$xtlightbox.YouTubeId = r[1];
		}
		return r;
	},

	getContent: function(element){
		if (!XtLightbox.Adaptor.cached(element)) throw new Error('Element content must be loaded first');
		return XtLightbox.Adaptor.load(element);
	},

	getSize: function(element){
		if (!XtLightbox.Adaptor.cached(element)) throw new Error('Element content must be loaded first');
		return {
			x: this.options.width,
			y: this.options.height
		};
	},

	setSize: function(element, size){
		if (!XtLightbox.Adaptor.cached(element)) throw new Error('Element content must be loaded first');
		var obj = document.id(XtLightbox.Adaptor.load(element));
		if (!obj.set){
			obj.width = size.x;
			obj.height = size.y;
		} else obj.set({
			width: size.x,
			height: size.y
		});
		return this;
	},

	load: function(element, callback){
		callback = callback || function(){};
		if (XtLightbox.Adaptor.cached(element)){
			callback(element);
			return this;
		}
		var params = {};
		if (this.options.iframe) params.wmode = 'transparent';
		if (this.options.fullscreen) params.fs = '1';
		if (!this.options.related) params.rel = '0';
		if (this.options.hd) params.hd = '1';
		if (this.options.autoplay) params.autoplay = '1';
		var a = [];
		for (var p in params){
			if (!params.hasOwnProperty(p)) continue;
			a.push(p + '=' + params[p]);
		}
		params = a.join('&');
		var obj;
		if (this.options.iframe) obj = new Element('iframe', {
			title: "YouTube video player",
			width: this.options.width,
			height: this.options.height,
			src: 'http://www.youtube.com/v/' + element.$xtlightbox.YouTubeId + '?' + params,
			frameborder: 0,
			allowfullscreen: ''
		});
		else obj = new Swiff('http://www.youtube.com/v/' + element.$xtlightbox.YouTubeId + '?' + params, {
			width: this.options.width,
			height: this.options.height,
			params: {
				allowFullScreen: 'true',
				wMode: 'transparent',
				bgcolor: '#ff3300'
			}
		});
		XtLightbox.Adaptor.cache(element, obj);
		callback(element);
		return this;
	}
});

/*
---
name: XtLightbox.Renderer

description: extendable lightbox Renderer base

license: MIT-style

authors:
- Anton Suprun <kpobococ@gmail.com>

requires: [More/Mask, XtLightbox]

provides: [XtLightbox.Renderer]

...
*/

XtLightbox.Renderer = new Class({

	Implements: [Options, Events],

	options: {
		// onPrevious,
		// onNext,
		// onClose,
		// onShow,
		// onHide,
		// onDestroy,
    
		texts: {
      prev: 'Previous', 
      next: 'Next', 
      close: 'Close', 
      position: 'Image {x} of {total}'
    },
		useMask: true,
		maskOptions: {},
		hideArrowsFor: [],
		hideSinglePosition: true
	},

	initialize: function(options){
		this.setOptions(options);
	},

	create: function(){
		if (this.element) return this;
    var self = this;
		this.element = new Element('div.app-lightbox').grab(
			this.elWrapper = new Element('div.app-lightbox-wrapper').adopt(
				new Element('div.app-lightbox-content-wrapper').adopt(
					this.elContent = new Element('div.app-lightbox-content'),
					this.elArrows  = new Element('div.app-lightbox-arrows').adopt(
						this.btnPrev = new Element('span.button.app-lightbox-prev')
              .adopt(new Element('span.tooltipElementDOM.app-lightbox-ico',{'title':self.options.texts.prev}))
              .addEvent('click', this.fireEvent.pass('previous', this)),
						this.btnNext = new Element('span.button.app-lightbox-next')            
              .adopt(new Element('span.tooltipElementDOM.app-lightbox-ico',{'title':self.options.texts.next}))
              .addEvent('click', this.fireEvent.pass('next', this))
					)
				),
				this.elFooter = new Element('div.app-lightbox-footer').grab(
					new Element('div.app-lightbox-footer-wrapper').adopt(
						this.btnClose = new Element('span.button.tooltipElementDOM.app-lightbox-close',{'title':self.options.texts.close}).addEvent('click', this.fireEvent.pass('close', this)),
						this.elTitle	= new Element('div.app-lightbox-title'),
						this.elPosition = new Element('div.app-lightbox-position'),
						new Element('div.app-cb')
					)
				)
			).addEvent('click', function(e) {
				e.stopPropagation();
			})
		).addEvent('click', this.fireEvent.pass('close', this));
		return this;
	},

	inject: function(){
		if (this.injected) return this;
		if (!this.element) this.create();
		var i = this.options.inject,
			t = i && i.target ? i.target : document.body,
			w = i && i.where  ? i.where  : 'inside';
		this.element.setStyle('display', 'none').inject(t, w);
		if (this.options.useMask && window.Mask) {
			this.mask = new Mask(document.body, Object.merge({
				'class': 'app-lightbox-mask',
				onClick: this.fireEvent.pass('close', this)
			}, this.options.maskOptions));
			this.addEvents({
				show: this.mask.show.bind(this.mask),
				hide: this.mask.hide.bind(this.mask),
				destroy: this.mask.destroy.bind(this.mask)
			});
		}
    App.Module.CreateTips();  
		this.injected = true;
		return this;
	},

	setLoading: function(v){
		this.toElement()[this.loading = !!v ? 'addClass' : 'removeClass']('loading');
		return this;
	},

	show: function(){
		if (!this.injected) this.inject();
		if (this.shown) return this;
		this.element.setStyle('display', '');
		this.shown = true;
		this.resize();
		this.fireEvent('show');
		return this;
	},

	hide: function(){
		if (!this.injected || !this.shown) return this;
		this.reset();
		this.element.setStyle('display', 'none');
		this.shown = false;
		this.fireEvent('hide');
		return this;
	},

	reset: function(){
		if (!this.injected) return this;
		this.resize();
		this.empty();
		this.elFooter.setStyle('display', 'none');
		return this;
	},

	empty: function(){
		if (!this.element) return this;
		this.elTitle.empty();
		this.elPosition.empty();
		this.elContent.empty();
		return this;
	},

	render: function(content, options){
		if (!content) return this;
		options = Object.append({
			close: true
		}, options);
		this.empty();
		this.elTitle.removeClass('show-title').set('text', options.title || '');
    if(options.title) this.elTitle.addClass('show-title');
		if (options.position && options.total && (!this.options.hideSinglePosition || options.total > 1)) {
			this.elPosition.set('text', this.options.texts.position.substitute({
				x: options.position,
				total: options.total
			}));
		}
		this.resize(options.size);
		this.elFooter.setStyle('display', '');
		this.elContent.empty().grab(content);
		this.btnPrev.setStyle('display', options.prev ? '' : 'none');
		this.btnNext.setStyle('display', options.next ? '' : 'none');
		if (this.options.hideArrowsFor.contains(this.rOpts.adaptor) || (!options.next && !options.prev)) this.elArrows.setStyle('display', 'none');
		else this.elArrows.setStyle('display', '');
		this.btnClose.setStyle('display', options.close ? '' : 'none');
		return this;
	},

	resize: function(size, callback){
		if (!this.shown) this.show();
		size = size || {};
		this.element.setStyles({
			width: size.x || '',
			height: size.y || ''
		});
		if (callback) callback();
		return this;
	},

	toElement: function(){
		if (!this.element) this.create();
		return this.element;
	},

	destroy: function(){
		this.element.destroy();
		this.fireEvent('destroy');
		return null;
	},

	getMaxSize: function(options){
		var t = this.elTitle.get('text'), p,
			d = this.elFooter.getStyle('display');
    this.elTitle.removeClass('show-title').set('text', options.title || '');
    if(options.title) this.elTitle.addClass('show-title');
		if (options.position && options.total && (!this.options.hideSinglePosition || options.total > 1)){
			p = this.elPosition.get('text');
			this.elPosition.set('text', this.options.texts.position.substitute({
				x: options.position,
				total: options.total
			}));
		}
		this.elFooter.setStyle('display', '');
		var winSize  = window.getSize();
		var elSize   = this.element.getSize();
		var contSize = this.elContent.getSize();
		// revert state
		this.elTitle.set('text', t || '');
		if (p) this.elPosition.set('text', p);
		this.elFooter.setStyle('display', d);
		return {
			x: winSize.x - (elSize.x - contSize.x),
			y: winSize.y - (elSize.y - contSize.y)
		};
	}

});

/*
---
name: XtLightbox.Renderer.Lightbox

description: extendable lightbox default Lightbox Renderer

license: MIT-style

authors:
- Anton Suprun <kpobococ@gmail.com>

requires: [Core/Fx.Tween, Core/Fx.Morph, XtLightbox.Renderer]

provides: [XtLightbox.Renderer.Lightbox]

...
*/

XtLightbox.Renderer.Lightbox = new Class({

	Extends: XtLightbox.Renderer,

	options: {
		maskFxOptions: {},
		widthFxOptions: {},
		heightFxOptions: {},
		contentFxOptions: {},
		footerFxOptions: {},
		hideArrowsFor: ['YouTube', 'Vimeo']
	},

	create: function(){
		this.parent();
		this.fxWidth = new Fx.Morph(this.element, Object.merge({}, this.options.widthFxOptions, {
			onStart: function(){},
			onCancel: function(){},
			onComplete: function(){
				this.onWidthChange();
			}.bind(this)
		}));
		this.fxTop = new Fx.Tween(this.element, Object.merge({}, this.options.heightFxOptions, {
			property: 'top',
			onStart: function(){},
			onCancel: function(){},
			onComplete: function(){}
		}));
		this.fxHeight = new Fx.Tween(this.elContent, Object.merge({}, this.options.heightFxOptions, {
			property: 'height',
			onStart: function(){},
			onCancel: function(){},
			onComplete: function(){
				this.onHeightChange();
			}.bind(this)
		}));
		this.fxContent = new Fx.Tween(this.elContent, Object.merge({}, this.options.contentFxOptions, {
			property: 'opacity',
			onStart: function(){},
			onCancel: function(){},
			onComplete: function(){
				this.onContentRender();
			}.bind(this)
		}));
		this.fxFooter = new Fx.Tween(this.elFooter, Object.merge({}, this.options.footerFxOptions, {
			property: 'height',
			onStart: function(){
				this.elFooter.setStyle('overflow', 'hidden');
			}.bind(this),
			onCancel: function(){},
			onComplete: function(){
				this.elFooter.setStyle('overflow', '');
			}.bind(this)
		}));
	},

	destroy: function(){
		delete this.fxWidth;
		delete this.fxTop;
		delete this.fxHeight;
		delete this.fxContent;
		delete this.fxFooter;
		return this.parent();
	},

	inject: function(){
		this.parent();
		this.removeEvents('show').removeEvents('hide');
		if (this.mask){
			this.mask.addEvent('click', this.fireEvent.pass('close', this));
			var fxShow = new Fx.Tween(this.mask, Object.merge({}, this.options.maskFxOptions, {
				property: 'opacity',
				onStart: function(){
					this.show();
				}.bind(this.mask),
				onCancel: function(){},
				onComplete: function(){}
			}));
			var fxHide = new Fx.Tween(this.mask, Object.merge({}, this.options.maskFxOptions, {
				property: 'opacity',
				onStart: function(){},
				onCancel: function(){},
				onComplete: function(){
					this.hide();
				}.bind(this.mask)
			}));
			var mo = this.options.maskOpacity || this.mask.toElement().getStyle('opacity') || 1;
			this.mask.toElement().setStyle('opacity', 0);
			this.addEvents({
				show: function(){
					fxHide.cancel();
					fxShow.start(mo);
				},
				hide: function(){
					fxShow.cancel();
					fxHide.start(0);
				}
			});
		}
	},

	empty: function(){
		this.parent();
		this.elFooter.setStyle('display', 'none');
		this.btnPrev.setStyle('display', 'none');
		this.btnNext.setStyle('display', 'none');
		this._opts = {};
		this._cont = null;
		this._fwopts = null;
		this.fxHeight.cancel();
		this.fxTop.cancel();
		this.fxWidth.cancel();
		this.fxContent.cancel();
		this.fxFooter.cancel();
		return this;
	},

	render: function(content, options){
		if (!content) return this;
		options = Object.append({
			close: true
		}, options);
		this.empty();
		this.elTitle.set('text', options.title || '');
		if (options.position && options.total && (!this.options.hideSinglePosition || options.total > 1)){
			this.elPosition.set('text', this.options.texts.position.substitute({
				x: options.position,
				total: options.total
			}));
		}
		this._opts = options;
		this._cont = content;
		this.resize(options.size);
		return this;
	},

	renderContent: function(){
		this.fxContent.set(0).start(1);
		return this;
	},

	onContentRender: function(){
		this.btnPrev.setStyle('display', this._opts.prev ? '' : 'none');
		this.btnNext.setStyle('display', this._opts.next ? '' : 'none');
		if (this.options.hideArrowsFor.contains(this._opts.adaptor) || (!this._opts.next && !this._opts.prev)) this.elArrows.setStyle('display', 'none');
		else this.elArrows.setStyle('display', '');
		this.btnClose.setStyle('display', this._opts.close ? '' : 'none');
		this.renderFooter();
	},

	renderFooter: function(){
		this.elFooter.setStyles({
			visibility: 'hidden',
			display: ''
		});
		var y = this.elFooter.getSize().y;
		this.elFooter.setStyles({
			visibility: 'visible',
			height: 0
		});
		this.fxFooter.start(y);
		return this;
	},

	resize: function(size){
		if (!this.shown) this.show();
		var winSize = window.getSize(), elSize;
		if (size && size.x && size.y){
			this.elFooter.setStyles({
				display: '',
				height: ''
			});
			var elFull = this.element.getSize();
			var elBox = {
				x: this.elWrapper.getStyle('width').toInt(),
				y: this.elWrapper.getStyle('height').toInt()
			};
			var fY = this.elFooter.getSize().y;
			this.elFooter.setStyle('display', 'none');
			elSize = {
				x: elFull.x - elBox.x + size.x,
				y: elFull.y - elBox.y + size.y + fY
			};
			this._fwopts = {
				width: elSize.x,
				left: Math.round((winSize.x - elSize.x) / 2)
			};
			if (size.y != this.elContent.getStyle('height').toInt()){
				this.resizing = true;
				this.fxHeight.start(size.y);
				this.fxTop.start(Math.round((winSize.y - elSize.y) / 2));
			} else this.onHeightChange();
		} else {
			// Reset size
			size = size || {};
			this.element.setStyle('width', size.x || '');
			this.elContent.setStyle('height', size.y || '');
			this.elFooter.setStyle('display', '');
			elSize = this.element.getSize();
			this.elFooter.setStyle('display', 'none');
			this.element.setStyles({
				left: Math.round((winSize.x - elSize.x) / 2),
				top: Math.round((winSize.y - elSize.y) / 2)
			});
		}
		return this;
	},

	onWidthChange: function(){
		this.resizing = false;
		this.elContent.grab(this._cont);
		this.renderContent();
		return this;
	},

	onHeightChange: function(){
		if (this._fwopts.width != this.element.getStyle('width').toInt()) {
			this.resizing = true;
			this.fxWidth.start(this._fwopts);
		} else this.onWidthChange();
		return this;
	},

	reset: function(){
		if (!this.injected) return this;
		this.resize();
		this.empty();
		this.elFooter.setStyle('display', 'none');
		return this;
	}

});
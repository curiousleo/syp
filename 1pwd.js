// vim: et:sw=2:ts=2:sts=2

$(function() {

  var scryptDefaults = { N: 16384, r: 8, p: 1 };
  var scryptParams = {};

  var Auth = Backbone.Model.extend({

    defaults: function() {
      return {
        login: 'user@example.com:0',
        alphabet: '!()+023456789=ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz',
        length: '24',
        order: Auths.nextOrder()
      };
    },

    initialize: function() {

      var props = ['login', 'alphabet', 'length'];
      var obj = {};
      var name = '';

      for (var i = 0; i < props.length; i++) {
        var name = props[i];
        if (!this.get(name)) {
          obj = {};
          obj[name] = this.defaults()[name];
          this.set(obj);
        }
      }

    },

  });


  var AuthCollection = Backbone.Collection.extend({

    model: Auth,
    localStorage: new Backbone.LocalStorage('1pwd'),

    nextOrder: function() {
      if (!this.length) return 1;
      return this.last().get('order') + 1;
    },

    comparator: function(auth) {
      return (-1) * auth.get('order');
    }

  });


  var Auths = new AuthCollection;

  var AuthView = Backbone.View.extend({

    tagName: 'li',
    template: _.template($('#auth-template').html()),

    events: {
      'click .copy': 'copy',
      'click .edit': 'edit',
      'click .delete': 'clear',
      'click .save': 'close',
      'keypress .login': 'closeOnEnter',
      'keypress .alphabet': 'closeOnEnter',
      'click .view span': 'copy'
    },

    initialize: function() {
      this.listenTo(this.model, 'change', this.render);
      this.listenTo(this.model, 'destroy', this.remove);
    },

    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      this.login = this.$('.login');
      this.alphabet = this.$('.alphabet');
      this.len = this.$('.length');
      return this;
    },

    closeOnEnter: function(e) {
      if (e.keyCode != 13) return;
      if (!this.login.val()) return;
      this.close();
    },

    edit: function() {
      this.$el.addClass("editing");
      this.login.focus();
    },

    close: function() {
      var login = this.login.val();
      var alphabet = this.alphabet.val();
      var len = this.len.val();
      if (!login) {
        this.clear();
      } else {
        this.model.save({ login: login, alphabet: alphabet, length: len });
        this.$el.removeClass('editing');
      }
    },

    clear: function() {
      this.model.destroy();
    },

    copy: function() {
      var password = scrypt.encode_utf8(this.model.get('login') + scryptParams['master']);
      var salt = new Uint8Array(scryptParams['saltEnc']);
      var len = parseInt(this.model.get('length'));
      var alphabet = this.model.get('alphabet');

      var scrypted = generatePassword(password, salt, scryptParams, len, alphabet);

      var container = $('#clipboard-container');
      container.empty().show();
      $('<textarea id="clipboard"></textarea>')
        .appendTo(container)
        .text(scrypted)
        .focus()
        .select();
    }

  });


  var AppView = Backbone.View.extend({

    el: $('#authapp'),

    events: {
      'keypress #master-password': 'setMasterOnEnter',
      'keypress #new-auth': 'createOnEnter',
      'click #clear-all': 'clearAll'
    },

    initialize: function() {
      var fragment = window.location.hash;
      var params = urlParams(fragment.replace('#', ''));

      var props = ['N', 'r', 'p'];
      var name = '';
      for (var i = 0; i < props.length; i++) {
        name = props[i];
        if (params[name]) {
          scryptParams[name] = parseInt(params[name]);
        } else {
          scryptParams[name] = scryptDefaults[name];
        }
      }

      if (!params['salt']) {
        params['salt'] = randomHex(16);
      }
      scryptParams['salt'] = params['salt'];
      scryptParams['saltEnc'] = hexStringToUint8Array(params['salt']);

      window.location.hash = $.param(scryptParams);

      this.loginInput = this.$('#new-auth');
      this.masterInput = this.$('#master-password');
      this.footer = this.$('footer');
      this.main = $('#main');

      this.listenTo(Auths, 'add', this.addOne);
      this.listenTo(Auths, 'reset', this.addAll);
      this.listenTo(Auths, 'all', this.render);

      this.loginInput.hide();
      $('#instructions .master').show();
    },

    render: function() {
      if (Auths.length) {
        this.main.show();
        this.footer.show();
        $('#instructions .empty').hide();
        $('#instructions .copy').show();
      } else {
        this.main.hide();
        this.footer.hide();
        $('#instructions .empty').show();
        $('#instructions .copy').hide();
      }
    },

    addOne: function(auth) {
      var view = new AuthView({ model: auth });
      this.$("#auth-list").prepend(view.render().el);
    },

    addAll: function() {
      Auths.each(this.addOne, this);
    },

    clearAll: function() {
      while ( (auth = Auths.shift()) ) {
        Auths.localStorage.destroy(auth);
      }
      return false;
    },

    setMasterOnEnter: function(e) {
      if (e.keyCode != 13) return;
      if (!this.masterInput.val()) return;

      this.master = this.masterInput.val();
      scryptParams.master = this.master;

      this.masterInput.hide();
      this.loginInput.show();
      $('#instructions .master').hide();
      $('#instructions .empty').show();

      Auths.fetch();
    },

    createOnEnter: function(e) {

      if (e.keyCode != 13) return;
      if (!this.loginInput.val()) return;

      Auths.create({ login: this.loginInput.val() });
      this.loginInput.val('');

    },

  });

  var App = new AppView;

});

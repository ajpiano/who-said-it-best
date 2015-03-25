var game = game || {};

;(function($) {
  var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  var hasSpeech = !!SpeechRecognition;

  var Root = React.createClass({
    getInitialState: function() {
      return {
        playing: false
      }
    },
    render: function() {
      var content = !this.state.playing ? "" : (
        <div>
          <PhraseZone />
          <PlayingField />
        </div>
      );
      return (
        <div>
          <Nav handleStopStart={this.handleStopStart} playing={this.state.playing}/>
          {content}
        </div>
      );
    },
    handleStopStart: function(e) {
      e.preventDefault();
      this.setState({playing: !this.state.playing});
    }
  });


  var Nav = React.createClass({
    render: function() {
      var buttons = this.props.playing ?
          <a href="#" onClick={this.props.handleStopStart}>Stop!</a> :
          <a href="#play" onClick={this.props.handleStopStart}>Play!</a>;
      return (
        <nav className='primary'>
          {buttons}
        </nav>
      );
    },
  });

  var Word = React.createClass({
    render: function() {
      return (
        <span className='phrase-word'>{this.props.word} </span>
      );
    }
  });

  var PhraseZone = React.createClass({
    getInitialState: function() {
      return {words: []}
    },
    componentDidMount: function() {
      $.getJSON("/phrase")
      .then(function(data){
        this.setState({words: _.pluck(data.words, "word")})
      }.bind(this))
    },
    render: function() {
      var words = this.state.words.map(function(word) {
        return (
          <Word word={word} key={word}/>
        );
      });
      return (
        <p>{words}</p>
      );
    }
  });

  var models = {}
  models.Recognition = Backbone.Model.extend({
    attributes: {
      transcript: "",
      confidence: 0,
      ended: false
    },
    initialize: function(a,b, options) {
      this.sr = new SpeechRecognition();
      this.sr.continuous = true;
      this.sr.interimResults = true;

      var stopAfterSpeakingStops = _.debounce(function() {
        this.stop();
      }.bind(this),2000);

      this.sr.onresult = function(e) {
        this.set(e.results[0][0]);
        stopAfterSpeakingStops();
      }.bind(this);

      this.sr.onend = function(e) {
        this.set('ended', true);
      }.bind(this);

      this.sr.start();
    },
    stop: function() {
      this.set('ended', true);
      this.sr.stop();
    }
  });
  models.Player = Backbone.Model.extend({
    attributes: {
      name: "Player",
    },
    initialize: function() {
      this.recognition = false;
    }
  });

  var Player = React.createClass({
    getInitialState: function() {
      this.resultCount = 0;
      return {
        speaking: false,
        transcript: "",
        score: 0
      };
    },
    render: function() {
      var buttonText = this.state.speaking ? "I'm Done!" : "Start Speaking!";
      var words = this.state.transcript.split
      var ended = this.props.player.recognition && this.props.player.recognition.get("ended");
      var button = ended ? "" : <button type="button" onClick={this.handleSpeakingStartStop}>{buttonText}</button>;
      var score = ended ? <h4 className="score">{this.state.score}</h4> : "";

      return (
        <div className="player">
          <h1>{this.props.player.get("name")}</h1>
          <PlayerPhraseZone words={this.state.transcript.split(" ")} key={this.resultCount}/>
          {score}
          {button} 
        </div>
      )
    },
    handleSpeakingStartStop: function() {
      if (this.state.speaking) {
        this.stopSpeaking();
      } else {
        this.startSpeaking();
      }
    },
    startSpeaking: function() {
      this.setState({speaking: true, transcript: ""});
      this.props.player.recognition = new models.Recognition();

      this.props.player.recognition.on("change:transcript", function(r, transcript) {
        this.resultCount++;
        this.setState({transcript: transcript});
      }.bind(this))

      this.props.player.recognition.on("change:confidence", function(r, confidence) {
        this.setState({score: Math.round(confidence * 10000)/100});
      }.bind(this))

      this.props.player.recognition.on("change:ended", function(r, fin) {
        if (fin && this.state.speaking) {
          this.stopSpeaking();
        }
      }.bind(this))

    },
    stopSpeaking: function() {
      this.setState({speaking: false});
      this.props.player.recognition.stop();
    }
  });

  var PlayerPhraseZone = React.createClass({
    getInitialState: function() {
      this.wordCount = 0;
      return {words: this.props.words};
    },
    render: function() {
      var words = this.state.words.map(function(word, i) {
        this.wordCount++;
        return (
          <Word word={word} key={this.wordCount}/>
        );
      }.bind(this));
      return (
        <p>{words}</p>
      );
    }
  });

  var PlayingField = React.createClass({
    getInitialState: function() {
      return {
        players: [
          new models.Player({name: "Player 1"}),
          new models.Player({name: "Player 2"})
        ]
      }
    },
    render: function() {
      return (
        <div id="playing-field">
          <Player player={this.state.players[0]} />
          <Player player={this.state.players[1]} />
        </div>
      )
    }
  });


  game.init = function() {
    React.render(
      <Root />,
      document.getElementById('react')
    );
  };

  $(function() {
    game.init();
  });

})(jQuery);

/* jshint evil: true */
'use strict';

/**
 * @extends {xss.InputStage}
 * @implements {xss.StageInterface}
 * @constructor
 */
xss.ChallengeStage = function() {
    this._challenge = this._getRandomChallenge();

    this.maxwidth = 80;
    this.header = 'DANGER DANGER';
    this.label = '' +
        'XSS mode allows the winner of a game to execute ' +
        'JavaScript in the browser of every loser. ' +
        ' To confirm that ' +
        'you know JavaScript and accept the risk, enter the ' +
        'result of the following statement:\n\n> ' +
        this._challenge + '\n> ';

    this.next = xss.InputXssStage;

    xss.InputStage.call(this);
};

xss.extend(xss.ChallengeStage.prototype, xss.InputStage.prototype);
xss.extend(xss.ChallengeStage.prototype, /** @lends {xss.ChallengeStage.prototype} */ {

    inputSubmit: function(error, value, top) {
        var shape, text = 'ACCESS DENIED!!';

        // Evalevaleval!!!
        // Tolerate answers where user is quoting strings.
        if (value.replace(/['"]/g, '').trim() === String(eval(this._challenge))) {
            text = '> bleep!';
            xss.event.off(xss.DOM_EVENT_KEYDOWN, xss.NS_INPUT);
            setTimeout(function() {
                xss.flow.switchStage(this.next);
            }.bind(this), 1000);
        }

        shape = xss.font.shape(text, xss.MENU_LEFT, top);
        shape.lifetime(0, 1000);

        xss.shapes.message = shape;
    },


    _challenges: [
        'var A=%d,B=3;do{A++}while(B--); A;',
        'var A=3,B=%d;do{A++}while(B--); B;',
        'var A=%d;A++;++A;A+=1; A;',
        'var A=%d;A--;--A;A-=1; A;',
        '"%d"+%d'
    ],

    _getRandomChallenge: function() {
        var randomStr, randomDigit, challenge;

        randomStr = xss.util.randomStr().substr(0, 3).toUpperCase();
        randomDigit = String(xss.util.randomRange(0, 5));

        challenge = String(xss.util.randomArrItem(this._challenges));
        challenge = challenge.replace(/%s/g, randomStr);
        challenge = challenge.replace(/%d/g, randomDigit);

        return challenge;
    }
});


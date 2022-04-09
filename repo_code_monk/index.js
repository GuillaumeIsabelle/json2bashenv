/**
 *  @description allows us to keep environment variables a JSON file (like package.json) 
 *  and expose them to bash scripts
 **/

const defaults = {
    "quote_character": "\'",
    "omit_variable_names_beginning_with_underscore": true,
    "disallow_two_underscores_in_a_row": true,
    "replace_illegal_chars_with": '',
    "arrays_become": String,
    "posix_mode": false
};

const bashify = (keybits,k,v,opts) => {

    let r = [], r2 = [];

    //  populate opts with default values, if they were not explicitely set
    if (opts === null || (typeof opts !== 'object')) {
        opts = defaults;
    } else {
        opts = Object.assign(defaults,opts);
    }

    //  remove illegal chars
    const asciiify = (key) => {
        let pattern = /[\W]/gi;
        let replaceWith = '';
        return key.replace(pattern,replaceWith);
    };

    //  glue together deep arrays with underscores.
    //  convert seperator-like chars to underscores
    const normalize = (arrayOfKeys) => {
        return arrayOfKeys.join('_').toUpperCase().replace(/[\-\s]+/g,'_');
    };

    const escapeChars = (str) => {
        let pat = new RegExp(opts.quote_character,'gi');
        return str.replace(pat,'\\$&');
    };

    const shellExpand = (str) => {
        //  perform shell expansion
        //  @note: we are only supporting expanding the tilde to $HOME for now
        //  to support more obscure expansions:
        //  https://www.gnu.org/software/bash/manual/html_node/Shell-Expansions.html#Shell-Expansions
        let r = str.replace('~',process.env.HOME);
        return r;
    };

    //  filter out falsey keys
    keybits = keybits.filter(v => { if (v === 0) return true; return (v); });

    switch (typeof v) {
        case 'number':
        case 'boolean':
        //  treat all scalars as strings
         r = {
            "key": asciiify(normalize(keybits)),
            "value": opts.quote_character + v + opts.quote_character
        }
        break;
        case 'string':
         r = {
            "key": asciiify(normalize(keybits)),
            "value": opts.quote_character + escapeChars(shellExpand(v)) + opts.quote_character
        }
        break;
        case 'object':
        //  it's null, so we use the empty string
        if (v === null) {
        r = {
                "key": asciiify(normalize(keybits)),
                "value": ""
            }
        } else if ( Array.isArray(v) ) {
            //  it's an array
            r = v.map( (vv,i) => {
                let theseKeyBits = keybits.concat(i);
                return bashify(theseKeyBits,i,vv);
            });
        } else {
            //  it's an object
            r = Object.keys(v).map(kk => {
                let theseKeyBits = keybits.concat(kk);
                return bashify(theseKeyBits,kk,v[kk]);
            });
        }
        break;
        default:
        throw new Error('Some weird datatype we didn\'t anticipate');
        break;
    }
    //  now flatten
    const flattenr = (obj) => {
        if (Array.isArray(obj)) {
            obj.forEach(row => {
                flattenr(row);
            });
        } else {
            r2.push(obj);
        }
    };
    flattenr(r);
    return r2;
}

module.exports = (jsonfile,prefix,opts) => {
    let data = bashify([prefix],'jsonfile',jsonfile,opts);
    return {
		flatArray() {
            let o = data.map(kv => {
                return {[kv.key]: kv.value};
            });
            return o;
		},
        export() {
            let o = data.map(kv => {
                return 'export ' + kv.key + '=' + kv.value;
            });
            return o.join('\n');
        },
        declare() {
            let o = data.map(kv => {
                return kv.key + '=' + kv.value;
            });
            return o.join('\n');  
        },
        oneLine() {
            let o = data.map(kv => {
                return kv.key + '=' + kv.value;
            });
            return o.join(' ');  
        }
    };
};

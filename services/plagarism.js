class Plagiarism {
    constructor(fileContent) {
        this.content = fileContent;
        this.tokens = {};
    }

    tokenize() {
        if (this.content.length >= 1) {
            this.content.join(' ').replace(/[^\w\s]/gi, ' ').split(' ').forEach(x => this.tokens[x] = (this.tokens[x] || 0) + 1);
            return this.tokens;
        } else {
            return {};
        }
    }
}

class CompareTokens {
    constructor(tokenSetA, tokenSetB) {
        this.tsa = tokenSetA;
        this.tsb = tokenSetB;
    }

    compare() {
        let result = Object.keys(this.tsa).filter(value => Object.keys(this.tsb).includes(value));
        let a = result.map(res => this.tsa[res]);
        let b = result.map(res => this.tsb[res]);

        return ((a.filter(v => b[a.indexOf(v)] === v).length / a.length) * 100).toFixed(2);
    }
}

exports.Plagiarism = Plagiarism;
exports.CompareTokens = CompareTokens;
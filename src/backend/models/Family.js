const { ObjectId } = require('mongodb');

class Family {
    constructor( name, members = []) {
        this.name = name;
        this.members = members;
    }

    addMember(member){
        this.members.push(member);
    }

    removeMember(memberId){
        this.members = this.members.filter(member => member.id !== memberId);
    }

}

module.exports = Family;
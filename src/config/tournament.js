import shortid from 'shortid'

const tournament = {
  tournamentId: 'tournament#1',
  amount: 39900,
  currency: 'INR',
  receipt: shortid.generate(),
  notes: {
    description: 'tournament enrollment'
  }
}

export default tournament

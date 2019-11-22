# Εφαρμογή τραπεζικών συναλλαγών (Κατανεμημένα Συστήματα)
###### *Παπακωνσταντίνου Θοδωρής - dai16253*

Το API και ο Client είναι διαθέσιμα προς εκτέλεση και διαδικτυακά στα αντίστοιχα links:
* [API] https://distsys-api.herokuapp.com/
* [CLIENT] https://distsys-client.herokuapp.com/

## API
Το back-end έχει υλοιποιηθεί σε Express JS ένα απλό framework της Javascript.

Για την εκτέλεσή του, αρχικά χρειάζεται να εγκαταστήσουμε τα dependencies με την εντολή `npm install`. Έπειτα μπορούμε να τρέξουμε το application με την εντολή `npm run start`.

Στον φάκελο routes/api υπάρχει η υλοποίηση του middleware.
Το αρχείο members έχει όλες τις ενέργειες που μπορεί να πράξει το API όσο αφορά τους χρήστες (CREATE, GET MEMBER, GET ALL MEMBERS).
Το αρχείο actions έχει όλες τις ενέργειες που μπορεί να κάνει ένας χρήστης στον λογαριασμό του (GET BALANCE, WITHDRAW, DEPOSIT).

## RPC
Το back-end επιτρέπει και κλήσεις τύπου JSONRPC. Αυτό γίνεται με βοήθεια webservices. Υπάρχει ένα route που ονομάζεται /rpc και μπορούν να γίνουν κλήσεις εκεί δίνοντας ως παράμετρο (στο σώμα του Request) την μέθοδο που θέλει να εκτελέσει ο Client. Αυτό βοηθάει στο να μην αλλάξει δραματικά η αρχιτεκτονική του υπάρχον Backend (API).

## Client
Το front-end έχει υλοποιηθεί σε React JS ένα framework που έχει υλοποιηθεί από την Facebook και είναι ένα απ'τα δημοφιλέστερα.

Για την εκτέλεση του, πρώτα εγκαθηστούμε τα dependencies με την εντολή `npm install` και έπειτα τρέχουμε το application με την εντολή `npm start`.

Ο Client καλεί από το API τις ενέργεις (GET MEMBER, GET BALANCE, WITHDRAW, DEPOSIT)


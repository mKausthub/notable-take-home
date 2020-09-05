const express = require('express');
const router = express.Router();
const _ = require('lodash');

// mock data for doctors, patients, appointments
const doctors = [
	{ id: 'd1', firstName: 'Hibbert', lastName: 'Julius' },
	{ id: 'd2', firstName: 'Krieger', lastName: 'Algerbnop' },
];

const patients = [
	{ id: 'p1', firstName: 'Sterling', lastName: 'Archer', kind: 'New Patient' },
	{ id: 'p2', firstName: 'Cyril', lastName: 'Figis', kind: 'Follow-up' },
	{ id: 'p3', firstName: 'Ray', lastName: 'Gilette', kind: 'New Patient' },
	{ id: 'p4', firstName: 'Lana', lastName: 'Lane', kind: 'Follow-up' },
];

const appointments = [
	{ id: 'a0', patientId: 'p4', date: 1535280200000, doctorId: 'd2' },
	{ id: 'a1', patientId: 'p1', date: 1599280200000, doctorId: 'd1' },
	{ id: 'a2', patientId: 'p2', date: 1559280200000, doctorId: 'd1' },
	{ id: 'a3', patientId: 'p3', date: 1569280200000, doctorId: 'd2' },
];

const miliSecondsPerDay = 24 * 60 * 60 * 1000;

const miliSecondsPerMinute = 60 * 1000;

const compareDateByDay = (aT, bT) =>
	_.round(aT / miliSecondsPerDay) === _.round(bT / miliSecondsPerDay);

const compareDateByMinutes = (aT, bT) =>
	_.round(aT / miliSecondsPerMinute) === _.round(bT / miliSecondsPerMinute);

const getMinutes = (timestamp) => new Date(timestamp).getMinutes();

const validMinutes = ['0', '15', '30', '45'];

router.get('/doctors', async (req, res) => {
	try {
		return res.status(200).send(doctors);
	} catch (err) {
		console.log('getting doctors failed: ', err);
		return res.status(500).send({ error: err.message });
	}
});

router.post('/appoints', async (req, res) => {
	console.log('here: ', req.body);
	const { doctorId, date } = req.body;
	if (doctorId && date) {
		try {
			// filter by doctor and date from teh appointments
			let appoints = _.filter(
				appointments,
				(a) => a.doctorId === doctorId && compareDateByDay(a.date, date)
			);
			// join with patient date from the patientId
			appoints = appoints.map((a) => {
				const patient = _.find(patients, (p) => p.id === a.patientId);
				return { ...a, patient: patient };
			});
			return res.status(200).send(appoints);
		} catch (err) {
			console.log('getting appointements failed: ', err);
			return res.status(500).send({ error: err.message });
		}
	} else {
		return res.status(400).send({ error: 'bad request' });
	}
});

router.delete('/deleteAppoint', async (req, res) => {
	const { appointmentId } = req.body;
	if (appointmentId) {
		try {
			// check if specific appointment exist
			const index = _.findIndex(appointments, (a) => a.id === appointmentId);
			if (index === -1) {
				return res.status(500).send({ error: "looks like specific appointment doesn't exist" });
			}
			// filter expect for the specific appointment
			const appoints = _.filter(appointments, (a) => a.id !== appointmentId);
			return res.status(200).send(appoints);
		} catch (err) {
			console.log('deleting appointement failed: ', err);
			return res.status(500).send({ error: err.message });
		}
	} else {
		return res.status(400).send({ error: 'bad request' });
	}
});

router.post('/addAppoint', async (req, res) => {
	const { doctorId, patientId, date } = req.body;
	if (doctorId && patientId && date) {
		try {
			// check if time is valid by 15 minutes interval
			if (!validMinutes.includes(getMinutes(date).toString()))
				return res
					.status(500)
					.send({ error: 'Appointments are possible only for 15 minutes intervals.' });
			// find the same time appointments
			const sameTimeAppoints = _.filter(
				appointments,
				(a) => a.doctorId === doctorId && compareDateByMinutes(a.date, date)
			);
			if (sameTimeAppoints.length >= 3)
				return res
					.status(500)
					.send(
						'This doctor is busy a bit. already appointed fully. Sorry, try again with another doctor'
					);
			appointments.push({
				id: 'a' + appointments.length,
				doctorId: doctorId,
				patientId: patientId,
				date: date,
			});
			return res.status(200).send(appointments);
		} catch (err) {
			console.log('adding appointement failed: ', err);
			return res.status(500).send({ error: err.message });
		}
	} else {
		return res.status(400).send({ error: 'bad request' });
	}
});

module.exports = router;

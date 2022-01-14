---
meta:
  title: GCN - Circulars
---

About GCN
=========

The General Coordinates Network (GCN) is a singular hub dedicated to the distribution of gamma-ray burst (GRB)/transient locations detected by various missions (Notices), and for receiving and automatically distributing to the GRB/transient community prose-style messages about follow-up observations on various GRBs/transien (Circulars).

Notices
-------

GCN Notices consist of distributing the GRB/transient locations determined by transient missions. The collection and distribtuion of these Notices is done without any humans-in-the-loop, and as such for missions with real-time downlinks, the time delays from when the GRB/transient happened to when the Notices is sent out to the customer is on the order of 2-10 secs. This combining of all the sources of GRB/transient location information into a single network means that sites need only maintain a single interface for all their GRB/transient needs.

Circulars
---------

Circulars allow the GRB community to submit messages to a central queue where they are automatically vetted and distributed (via email) to the entire GRB community. Circulars are prose-style messages from follow-up observers reporting on their results, or for coordinating with others.

History of GCN: BACODINE: BAtse COordinates DIstribution NEtwork
================================================================

The real-time transmission of the data from the COMPTON-GRO spacecraft allows for access to BATSE instrument data that can be used to make simultaneous and near-simultaneous multi-band observations of Gamma Ray Bursts (GRBs). The BACODINE system (1) monitors this telemetry stream, (2) extracts the appropriate information from the BATSE portion, (3) detects the occurrence of a GRB, (4) calculates the approximate coordinates for the burst, and (5) distributes those coordinates to instruments, observatories, and other interested parties around the world. This is done with custom hardware plus software located at the NASA Goddard Space Flight Center mission operations center for CGRO. The maximum time delay between the arrival of the GRB photons at the BATSE detectors and the calculation of the coordinates is 5.5 seconds. The accuracy of the calculated coordinates is ~10 degrees (typical worst case). The coordinates can be distributed by phone connections, by direct computer-to-computer socket connections over the Internet, by e-mail, and by alpha-numeric pager to any optical, infrared, radio, and TeV telescope systems with wide field-of-view capabilities. This rapid distribution of coordinates (0.3 to 30 sec, depending on the distribution method) allows for a 4 to 6 order of magnitude improvement over previous efforts in the response time of follow-up observations of the optical and radio emission of GRBs. This greatly increased the likelihood of a detection and hence, of the identification of the counterparts of GRBs and solving one of astrophysics' greatest mysteries.

And when other missions/instruments were added (beyond the original CGRO-BATSE source), the name was changed from BACODINE to the more general GCN name (and then more non-GRB transients so it sometimes called GCN/TAN).

The pictures below show schematically the flow of information through the telemetry system and a world map of the BACODINE sites. In the left picture, the gamma rays from a GRB hit the BATSE detectors on CGRO, and then the telemetry data are transmitted up to a TDRS satellite, down to White Sands, up to DOMSAT, and down to GFSC, where they are processed by BACODINE. The right picture shows the locations around the world of the various BACODINE sites.

[GCN Technical Description]({{ url_for('documentation')}})

[FAQ]({{ url_for('faq')}})

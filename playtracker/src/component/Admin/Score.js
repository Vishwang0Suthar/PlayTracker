import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import './Score.css';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const CricketScoreboard = () => {
    const location = useLocation();
    const [batsman1, setBatsman1] = useState('');
    const [batsman2, setBatsman2] = useState('');
    const [batsman1Stats, setBatsman1Stats] = useState({ runs: 0, balls: 0, fours: 0, sixes: 0, ballsFaced: 0, strikeRate: 0 });
    const [batsman2Stats, setBatsman2Stats] = useState({ runs: 0, balls: 0, fours: 0, sixes: 0, ballsFaced: 0, strikeRate: 0 });
    const [batsman1Locked, setBatsman1Locked] = useState(false);
    const [batsman2Locked, setBatsman2Locked] = useState(false);
    const [bowler, setBowler] = useState('');
    const [bowlerStats, setBowlerStats] = useState({ overs: 0, runs: 0, wickets: 0, economy: 0 });
    const [bowlerLocked, setBowlerLocked] = useState(false);
    const [score, setScore] = useState(0);
    const [extras, setExtras] = useState({ wide: 0, noBall: 0, legByes: 0 });
    const [isWicketDialogOpen, setIsWicketDialogOpen] = useState(false);
    const [selectedWicketOption, setSelectedWicketOption] = useState('');
    const [overs, setOvers] = useState(0);
    const [strikeBatsman, setStrikeBatsman] = useState(1); // 1 for batsman1, 2 for batsman2
    const [overSummary, setOverSummary] = useState([]);
    const [wickets, setWickets] = useState(0); // State variable to hold the wicket count
    const [ballsBowled, setBallsBowled] = useState(0); // State variable to hold the count of balls bowled by the current bowler

    const [batsmen, setBatsmen] = useState([]);
    const [bowlers, setBowlers] = useState([]);
    const [battingTeam, setBattingTeam] = useState(''); // State variable to hold the batting team


    const sendDataToBackend = async () => {
        try {
            const dataToSend = {
                batsman1,
                batsman2,
                batsman1Stats,
                batsman2Stats,
                batsman1Locked,
                batsman2Locked,
                bowler,
                bowlerStats,
                bowlerLocked,
                score,
                extras,
                isWicketDialogOpen,
                selectedWicketOption,
                overs,
                strikeBatsman,
                overSummary,
                wickets,
                ballsBowled,
                batsmen,
                bowlers,
                battingTeam
            };

            const response = await axios.post(`http://localhost:8000/api/match/${location.state.mID}/states`, dataToSend);
            if (response.status === 200) {
                console.log('Data sent successfully!');

            } else {
                console.error('Failed to send data to the backend');
            }
        } catch (error) {
            console.error('Error occurred while sending data to the backend:', error);
        }
    };

    // useEffect(() => {
    //     console.log('score:', score);
    //     console.log('overs:', overs);
    //     console.log('batsman1Stats:', batsman1Stats);
    //     console.log('batsman2Stats:', batsman2Stats);
    //     console.log('bowlerStats:', bowlerStats);
    //     console.log('extras:', extras);
    //     console.log('overSummary:', overSummary);
    //     console.log('wickets:', wickets);

    //     // sendDataToBackend();
    // }, [score, overs, batsman1Stats, batsman2Stats, bowlerStats, extras, overSummary, wickets]);

    useEffect(() => {
        const fetchPlayers = async () => {
            try {
                const response = await fetch(`http://localhost:8000/api/players/${location.state.mID}`);
                if (response.ok) {
                    const data = await response.json();
                    setBatsmen(data);
                    setBowlers(data);
                } else {
                    console.error('Failed to fetch player names');
                }
            } catch (error) {
                console.error('Error occurred while fetching player names:', error);
            }
        };
        fetchPlayers();
    }, [location.state.mID]);

    const handleBattingTeamChange = (e) => {
        setBattingTeam(e.target.value);
    };

    useEffect(() => {
        updateStrikeRate(batsman1Stats, batsman1);
        updateStrikeRate(batsman2Stats, batsman2);
    }, [score, extras, overs, batsman1Stats, batsman2Stats, bowlerStats]);

    const formatOvers = (overs) => {
        const integerPart = Math.floor(overs);
        const decimalPart = Math.round((overs - integerPart) * 10);
        return `${integerPart}.${decimalPart}`;
    };

    const updateScore = (runs) => {
        setScore(score + runs);
        // Update batsman stats
        const updatedBatsmanStats = strikeBatsman === 1 ? { ...batsman1Stats } : { ...batsman2Stats };
        updatedBatsmanStats.runs += runs;
        updatedBatsmanStats.ballsFaced += 1;
        if (strikeBatsman === 1) {
            setBatsman1Stats(updatedBatsmanStats);
        } else {
            setBatsman2Stats(updatedBatsmanStats);
        }
        updateBowlerStats(runs);
        // Update overs
        let updatedOvers = overs;
        const currentBall = overs - Math.floor(overs);
        if (currentBall < 0.5) {
            // If the current ball is less than 0.5, just increment by 0.1
            updatedOvers += 0.1;
        } else {
            // If the current ball is 0.5 or more, increment to the next integer
            updatedOvers = Math.floor(overs) + 1;
        }
        setOvers(updatedOvers);

        // Update over summary
        const newOverSummary = [...overSummary];
        const currentOver = Math.floor(updatedOvers);
        const lastOverIndex = newOverSummary.length - 1;
        if (lastOverIndex >= 0 && newOverSummary[lastOverIndex].over === currentOver) {
            // Add the run to the current over
            newOverSummary[lastOverIndex].runs += runs;
        } else {
            // Start a new over
            newOverSummary.push({ over: currentOver, runs: runs.toString() });
        }
        setOverSummary(newOverSummary);

        // Update strike batsman based on runs
        if (runs % 2 !== 0) {
            setStrikeBatsman((prevStrike) => (prevStrike === 1 ? 2 : 1));
        }

        // Increment balls bowled for the current bowler
        setBallsBowled((ballsBowled) => ballsBowled + 1);
        // Check if 6 balls are bowled, then ask for the next bowler
        if (ballsBowled === 5) {
            handleNextBowler();
            setBallsBowled(0); // Reset ballsBowled to 0 after changing the bowler
        }
    };

    const updateExtras = (type, isChecked) => {
        if (isChecked) {
            const updatedExtras = { ...extras };
            updatedExtras[type]++;
            setExtras(updatedExtras);
        }
    };

    const handleBatsmanChange = (e, batsmanNumber) => {
        const value = e.target.value;
        if (batsmanNumber === 1) {
            setBatsman1(value);
        } else {
            setBatsman2(value);
        }
    };

    const handleSaveBatsman = (batsmanNumber) => {
        if (batsmanNumber === 1) {
            setBatsman1Locked(true);
        } else {
            setBatsman2Locked(true);
        }
    };

    const handleBowlerChange = (e) => {
        setBowler(e.target.value);
    };

    const handleSaveBowler = () => {
        setBowlerLocked(true);
    };

    const handleOpenWicketDialog = () => {
        setIsWicketDialogOpen(true);
    };

    const handleCloseWicketDialog = () => {
        setIsWicketDialogOpen(false);
    };

    const handleWicketOptionChange = (e) => {
        setSelectedWicketOption(e.target.value);
    };

    const handleNextBowler = () => {
        // Reset balls bowled for the current bowler
        setBallsBowled(0);
        // Unlock the bowler field
        setBowlerLocked(false);
        // Reset the bowler selection
        setBowler('');
    };

    const handleNextOver = () => {
        // Increment overs
        const updatedOvers = overs + 1;
        setOvers(updatedOvers);
        // Update over summary
        const newOverSummary = [...overSummary];
        newOverSummary.push({ over: updatedOvers, runs: 0 });
        setOverSummary(newOverSummary);
        // Reset the strike batsman
        setStrikeBatsman(1);
    };

    const handleWicketConfirm = () => {
        // Process selected wicket option
        console.log('Selected wicket option:', selectedWicketOption);

        // Increment the wicket count
        setWickets(wickets + 1);

        // Update wicket count in extras
        updateExtras('wickets', true);

        // Close the dialog
        setIsWicketDialogOpen(false);

        // Reset the out batsman based on the selected striker
        if (strikeBatsman === 1) {
            setBatsman1('');
            setBatsman1Locked(false); // Unlock the field
        } else {
            setBatsman2('');
            setBatsman2Locked(false); // Unlock the field
        }

        // Update striker batsman
        setStrikeBatsman(strikeBatsman === 1 ? 2 : 1);
    };


    const updateStrikeRate = (batsmanStats, batsmanName) => {
        if (batsmanStats.ballsFaced > 0) {
            const strikeRate = (batsmanStats.runs / batsmanStats.ballsFaced) * 100;
            if (batsmanName === batsman1) {
                setBatsman1Stats((prevStats) => ({
                    ...prevStats,
                    strikeRate: strikeRate,
                }));
            } else {
                setBatsman2Stats((prevStats) => ({
                    ...prevStats,
                    strikeRate: strikeRate,
                }));
            }
        }
    };

    const updateBowlerStats = (runsBowled = 0) => {
        const totalRuns = score + extras.wide + extras.noBall + extras.legByes;
        const runsByCurrentBowler = totalRuns - bowlerStats.runs;
        const economy = runsByCurrentBowler / (overs || 1);
        setBowlerStats((prevStats) => ({
            ...prevStats,
            runs: totalRuns,
            overs: overs,
            wickets: extras.wickets,
            economy: economy,
        }));
    };
    const updateExtras1 = (value) => {
        value = parseInt(value);

        // Update batsman score
        const updatedBatsmanRuns = strikeBatsman === 1 ? batsman1Stats.runs + value : batsman2Stats.runs + value;
        updateBatsmanScore(updatedBatsmanRuns);

        // Update score
        const updatedScore = score + 1 + value;
        setScore(updatedScore);
        updateOversonly(0);
        // Update bowler's runs
        const updatedBowlerRuns = bowlerStats.runs + value + 1;

        // Update extras
        const updatedExtras = { ...extras, noBall: extras.noBall + 1 };
        setExtras(updatedExtras);

        const updatedBowlerStats = { ...bowlerStats, overs: bowlerStats.overs + 1 };
        // Set the updated bowler stats with the updated runs
        setBowlerStats({ ...bowlerStats, runs: updatedBowlerRuns });
    };


    const updateBatsmanScore = (runs, batsmanNumber) => {
        // Determine which batsman is on strike
        const currentBatsmanStats = batsmanNumber === 1 ? batsman1Stats : batsman2Stats;

        // Update batsman stats
        const updatedBatsmanStats = {
            ...currentBatsmanStats,
            runs: currentBatsmanStats.runs + runs,
            ballsFaced: currentBatsmanStats.ballsFaced + 1
        };

        // Update the corresponding batsman's stats
        if (batsmanNumber === 1) {
            setBatsman1Stats(updatedBatsmanStats);
        } else {
            setBatsman2Stats(updatedBatsmanStats);
        }
        const updatedBowlerStats = { ...bowlerStats };
        updatedBowlerStats.runs += runs;
        setBowlerStats(updatedBowlerStats);
        setScore(score + runs);
    };

    const updateExtras2 = (isChecked, value) => {
        value = parseInt(value);
        setScore(score + value);

        // Update bowlerStats to add value
        const updatedBowlerStats = { ...bowlerStats, runs: bowlerStats.runs + parseInt(value) };

        // Update bowlerStats.overs by 0.1
        const updatedBowlerStatsWithOvers = { ...updatedBowlerStats, overs: bowlerStats.overs + 0.1 };
        setBowlerStats(updatedBowlerStatsWithOvers);

        // Update extras to add value
        const updatedExtras = { ...extras, legByes: extras.legByes + value };
        setExtras(updatedExtras);

        // Update overs by 0.1
        updateOversonly(0.1);
    };


    const updateExtras3 = (value) => {
        value = parseInt(value);
        setScore(score + value);

        // Update bowlerStats to add value
        const updatedBowlerStats = { ...bowlerStats, runs: bowlerStats.runs + parseInt(value) };

        // Update bowlerStats.overs by 0.1

        // Update extras to add value
        const updatedExtras = { ...extras, wide: extras.wide + value };
        setExtras(updatedExtras);
        // Update overs by 0.1
    };

    //     const handleLegByes = (runs) => {
    //     // Update score
    //     setScore(score + runs);

    //     // Update bowler stats
    //     const updatedBowlerStats = { ...bowlerStats };
    //     updatedBowlerStats.runs += runs;
    //     setBowlerStats(updatedBowlerStats);

    //     // Update overs
    //     let updatedOvers = overs;
    //     const currentBall = overs - Math.floor(overs);
    //     if (currentBall < 0.5) {
    //         // If the current ball is less than 0.5, just increment by 0.1
    //         updatedOvers += 0.1;
    //     } else {
    //         // If the current ball is 0.5 or more, increment to the next integer
    //         updatedOvers = Math.floor(overs) + 1;
    //     }
    //     setOvers(updatedOvers);

    //     // Update extras
    //     const updatedExtras = { ...extras };
    //     updatedExtras.legByes += runs;
    //     setExtras(updatedExtras);
    // };
    const updateScoreonly = (runs) => {
        setScore(score + runs);

        // Update batsman stats
        const updatedBatsmanStats = strikeBatsman === 1 ? { ...batsman1Stats } : { ...batsman2Stats };
        // updatedBatsmanStats.runs += runs;
        updatedBatsmanStats.ballsFaced += 1;
        if (strikeBatsman === 1) {
            setBatsman1Stats(updatedBatsmanStats);
        } else {
            setBatsman2Stats(updatedBatsmanStats);
        }

        // Update strike batsman based on runs
        if (runs % 2 !== 0) {
            setStrikeBatsman((prevStrike) => (prevStrike === 1 ? 2 : 1));
        }

        // Increment balls bowled for the current bowler
        setBallsBowled((ballsBowled) => ballsBowled + 1);
        // Check if 6 balls are bowled, then ask for the next bowler
        if (ballsBowled === 5) {
            handleNextBowler();
            setBallsBowled(0); // Reset ballsBowled to 0 after changing the bowler
        }
    };

    const updateOversonly = (runs) => {
        // Update overs
        let updatedOvers = overs;
        const currentBall = overs - Math.floor(overs);
        if (currentBall < 0.5) {
            // If the current ball is less than 0.5, just increment by 0.1
            updatedOvers += 0.1;
        } else {
            // If the current ball is 0.5 or more, increment to the next integer
            updatedOvers = Math.floor(overs) + 1;
        }
        setOvers(updatedOvers);

        // Update over summary
        const newOverSummary = [...overSummary];
        const currentOver = Math.floor(updatedOvers);
        const lastOverIndex = newOverSummary.length - 1;
        if (lastOverIndex >= 0 && newOverSummary[lastOverIndex].over === currentOver) {
            // Add the run to the current over
            newOverSummary[lastOverIndex].runs += runs;
        } else {
            newOverSummary.push({ over: currentOver, runs: runs.toString() });
        }
        setOverSummary(newOverSummary);
    };

    return (

        // Inside the component's return statement


        <div>
            {battingTeam && (
                // Rest of the component's JSX code
                <div>
                    {/* Navbar */}
                    <nav className="navbar">
                        <div className="navbar-brand">
                            <span>{battingTeam}</span>
                            <span> vs </span>
                            <span> Team 2</span>
                        </div>
                    </nav>
                    {/* Rest of the component's JSX code */}
                </div>
            )}
            {/* Navbar */}
            <nav className="navbar">
                <div className="navbar-brand">
                    <span>Team 1 </span>
                    <span>vs</span>
                    <span> Team 2</span>
                </div>
            </nav>
            <div className="Score">
                <span>Team 1: {score}/{wickets} ({formatOvers(overs)})</span>
            </div>
            <div className="cricket-scoreboard">
                <div>
                    <label>Batsman 1:</label>
                    <select value={batsman1} onChange={(e) => handleBatsmanChange(e, 1)}>
                        <option value="">Select Batsman</option>
                        {batsmen.map((player) => (
                            <option key={player} value={player}>{player}</option>
                        ))}
                    </select>
                    {!batsman1Locked && <button onClick={() => handleSaveBatsman(1)}>Save</button>}
                </div>
                <div>
                    <label>Batsman 2:</label>
                    <select value={batsman2} onChange={(e) => handleBatsmanChange(e, 0)}>
                        <option value="">Select Batsman</option>
                        {batsmen.map((player) => (
                            <option key={player} value={player}>{player}</option>
                        ))}
                    </select>
                    {!batsman2Locked && <button onClick={() => handleSaveBatsman(2)}>Save</button>}
                </div>
                <div>
                    <label>Bowler:</label>
                    <select value={bowler} onChange={(e) => setBowler(e.target.value)}>
                        <option value="">Select Bowler</option>
                        {bowlers.map((player) => (
                            <option key={player} value={player}>{player}</option>
                        ))}
                    </select>
                    {!bowlerLocked && <button onClick={handleSaveBowler}>Save</button>}
                </div>
            </div>
            {/* Check if batsmen and bowler are locked */}
            {(batsman1Locked && batsman2Locked && bowlerLocked) && (
                <div>
                    {/* Over Info */}
                    <div className="over-info">
                        {overSummary.map((over, index) => (
                            <div key={index} className="over">
                                <span>Over {over.over}:</span>
                                <div className="run-circles">
                                    {[0, 1, 2, 3, 4, 5].map((ballIndex) => (
                                        <div key={ballIndex} className="run-circle" style={{
                                            backgroundColor:
                                                over.runs[ballIndex] === "4" || over.runs[ballIndex] === "6" ? "green" :
                                                    over.runs[ballIndex] === "W" ? "red" :
                                                        "light gray"
                                        }}>{over.runs[ballIndex] || "-"}</div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Batsman Scoreboard */}
                    <table className="scoreboard">
                        <thead>
                            <tr>
                                <th>Batsman</th>
                                <th>Runs</th>
                                <th>Balls</th>
                                <th>4s</th>
                                <th>6s</th>
                                <th>Strike Rate</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{strikeBatsman === 1 ? '*' : ''}{batsman1}</td>
                                <td>{batsman1Stats.runs}</td>
                                <td>{batsman1Stats.ballsFaced}</td>
                                <td>{batsman1Stats.fours}</td>
                                <td>{batsman1Stats.sixes}</td>
                                <td>{batsman1Stats.strikeRate.toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td>{strikeBatsman === 2 ? '*' : ''}{batsman2}</td>
                                <td>{batsman2Stats.runs}</td>
                                <td>{batsman2Stats.ballsFaced}</td>
                                <td>{batsman2Stats.fours}</td>
                                <td>{batsman2Stats.sixes}</td>
                                <td>{batsman2Stats.strikeRate.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Bowler Scoreboard */}
                    <table className="scoreboard">
                        <thead>
                            <tr>
                                <th>Bowler</th>
                                <th>Overs</th>
                                <th>run</th>
                                <th>Wickets</th>
                                <th>Economy</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{bowler}</td>
                                <td>{formatOvers(bowlerStats.overs)}</td>
                                <td>{bowlerStats.runs}</td>
                                <td>{bowlerStats.wickets}</td>
                                <td>{bowlerStats.economy.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Extras */}
                    <table className="scoreboard">
                        <thead>
                            <tr>
                                <th>Extras</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Total</td>
                                <td>{parseInt(extras.wide) + parseInt(extras.noBall) + parseInt(extras.legByes)}</td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Buttons */}
                    <div className="buttons">
                        {/* Buttons */}
                        <div className="button-group">
                            {[0, 1, 2, 3, 4, 5, 6].map((run, index) => (
                                <button key={index} onClick={() => {
                                    updateScore(run);
                                    sendDataToBackend();
                                }}>{run}</button>
                            ))}
                        </div>
                        <button className="wicket-button" onClick={handleOpenWicketDialog} style={{ backgroundColor: "red" }}>Wicket</button>
                        {/* Checkboxes */}
                        <div className="checkbox-group">
                            <div className="checkbox-container">
                                <select onChange={(e) => {
                                    updateExtras1(e.target.value);
                                    sendDataToBackend();
                                }}>
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                    <option value="5">5</option>
                                    <option value="6">6</option>
                                </select>
                                <label htmlFor="legByes">noBall</label>
                            </div>
                            <div className="checkbox-container">
                                <select onChange={(e) => {
                                    updateExtras2(e.target.checked, e.target.value)
                                    sendDataToBackend();
                                }}>
                                    <option value="">Select Runs</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                    <option value="5">5</option>
                                    <option value="6">6</option>
                                </select>
                                <label htmlFor="penalty">Penalty/legbyes</label>
                            </div>
                            <div className="checkbox-container">
                                <select onChange={(e) => {
                                    updateExtras3(e.target.value)
                                    sendDataToBackend();
                                }}>
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                    <option value="5">5</option>
                                    <option value="6">6</option>
                                </select>
                                <label htmlFor="legByes">Wide</label>
                            </div>

                        </div>
                    </div>

                    {/* Wicket Dialog */}
                    <Modal
                        isOpen={isWicketDialogOpen}
                        onRequestClose={handleCloseWicketDialog}
                        contentLabel="Wicket Options"
                        className="wicket-dialog"
                        overlayClassName="wicket-overlay"
                    >
                        <h2>Choose Wicket Option</h2>
                        <div>
                            <input type="radio" id="bowled" name="wicketOption" value="Bowled" onChange={handleWicketOptionChange} />
                            <label htmlFor="bowled">Bowled</label>
                        </div>
                        <div>
                            <input type="radio" id="hitWicket" name="wicketOption" value="Hit Wicket" onChange={handleWicketOptionChange} />
                            <label htmlFor="hitWicket">Hit Wicket</label>
                        </div>
                        <div>
                            <input type="radio" id="caught" name="wicketOption" value="Caught" onChange={handleWicketOptionChange} />
                            <label htmlFor="caught">Caught</label>
                        </div>
                        <div>
                            <input type="radio" id="runOut" name="wicketOption" value="Run Out" onChange={handleWicketOptionChange} />
                            <label htmlFor="runOut">Run Out</label>
                        </div>
                        <div>
                            <input type="radio" id="stump" name="wicketOption" value="Stump" onChange={handleWicketOptionChange} />
                            <label htmlFor="stump">Stump</label>
                        </div>
                        <button onClick={handleWicketConfirm}>Confirm</button>
                        <button onClick={handleCloseWicketDialog}>Cancel</button>
                    </Modal>
                </div>
            )}
        </div>
    );
};

export default CricketScoreboard;

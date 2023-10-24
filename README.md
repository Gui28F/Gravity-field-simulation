# Gravity field simulation

In this work we simulate the movement of a large number of small masses, which we will designate by particles, in the presence of bodies with very large masses, as if they were planets. Let's treat the planets as being fixed and consider only the forces they cause on smaller masses.
To simulate the movement of a particle it will be necessary to calculate the total force caused by all the planets, in the place where the particle is located. Then, determining its acceleration, its position will be updated at each interval of the simulation.
In short, the program will be interactive and should allow the user to control the placement of particles and the placement of planets.

Demo: https://gui28f.github.io/Gravity-field-simulation/projects/project-1/
|  | Interval | Initial value| Control |
| --- | --- | --- | --- |																																													
| Minimum value for particle lifetime | [1,19] | 2	| 'q' - increase 'a' - decrease |
| Maximum value for particle lifetimes | [2,20] | 10	| 'w' - increase 's' - decrease |
| Place where particles are injected | (0,0) | (0,0)| Mouse movement with SHIFT key pressed |
| Minimum speed of new particles | 0.1 | 0.1 | SHIFT+Page Up - increase SHIFT+Page Down - decrease |
| Maximum speed of new particles | 0.2 | 0.2| Page Up - increase Page Down - decrease |
| Angle (with the horizontal) that indicates the central direction for the velocity of the new particles | [-\infinite,+\infinite] | 0 | Arrow Left - rotate left Arrow Right - rotate right |
| Maximum variation of direction of new particles (particle source opening) | [0,+\pi] | \pi | Arrow Up - increase the aperture Arrow Down - decrease the aperture |

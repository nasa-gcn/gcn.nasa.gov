---
handle:
  breadcrumb: NPR 7150
---

import { Table } from '@trussworks/react-uswds'

# NPR 7150

NASA-funded sofware projects must comply with software engineering requirements specified by the [NASA Procedural Requirements (NPR) 7150.2D](https://nodis3.gsfc.nasa.gov/displayDir.cfm?t=NPR&c=7150&s=2D) document.

The software classification determines which of NPR 7150.2D's requirements are in force. GCN is classified as [Class D software for non-safety-criticial applications](https://nodis3.gsfc.nasa.gov/displayDir.cfm?Internal_ID=N_PR_7150_002D_&page_name=AppendixD). GCN is fully compliant with the requirements for that classifiation. One of the requirements is that there must be a [requirements matrix](https://nodis3.gsfc.nasa.gov/displayDir.cfm?Internal_ID=N_PR_7150_002D_&page_name=AppendixC), which is satisfied by the table below.

 <Table bordered>
  <thead>
    <tr>
      <th>NPR section #</th>
      <th>Requirement text</th>
      <th>Complies how?</th>
    </tr>
  </thead>
  <tbody>
    <tr><td colSpan="3">Software Management Requirements</td></tr>
    <tr>
      <td>3.1.2</td>
      <td>The project manager shall assess options for software acquisition versus development.</td>
      <td>Reuse OSS and SaaS products</td>
    </tr>
    <tr>
      <td>3.1.3</td>
      <td>The project manager shall develop, maintain, and execute software plans, including security plans, that cover the entire software life cycle and, as a minimum, address the requirements of this directive with approved tailoring.</td>
      <td>These docs</td>
    </tr>
    <tr>
      <td>3.1.4</td>
      <td>
        The project manager shall track the actual results and performance of software activities against the software plans.
        <ol type="a">
          <li>Corrective actions are taken, recorded, and managed to closure.</li>
          <li>Changes to commitments (e.g., software plans) that have been agreed to by the affected groups and individuals are taken, recorded, and managed.</li>
        </ol>
      </td>
      <td>GitHub issues</td>
    </tr>
    <tr>
      <td>3.1.5</td>
      <td>The project manager shall define and document the acceptance criteria for the software.</td>
      <td>[GitHub Actions](https://docs.github.com/en/actions/learn-github-actions/understanding-github-actions) workflows must pass</td>
    </tr>
    <tr>
      <td>3.1.6</td>
      <td>The project manager shall establish and maintain the software processes, software documentation plans, list of developed electronic products, deliverables, and list of tasks for the software development that are required for the project’s software developers, as well as the action required (e.g., approval, review) of the Government upon receipt of each of the deliverables.</td>
      <td>These docs</td>
    </tr>
    <tr>
      <td>3.1.7</td>
      <td>The project manager shall define and document the milestones at which the software developer(s) progress will be reviewed and audited.</td>
      <td>GitHub milestones</td>
    </tr>
    <tr>
      <td>3.1.8</td>
      <td>
        The project manager shall require the software developer(s) to periodically report status and provide insight into software development and test activities; at a minimum, the software developer(s) will be required to allow the project manager and software assurance personnel to:
        <ol type="a">
          <li>Monitor product integration.</li>
          <li>Review the verification activities to ensure adequacy.</li>
          <li>Review trades studies and source data.</li>
          <li>Audit the software development processes and practices.</li>
          <li>Participate in software reviews and technical interchange meetings.</li>
        </ol>
      </td>
      <td>Sprint meetings</td>
    </tr>
    <tr>
      <td>3.1.9</td>
      <td>The project manager shall require the software developer(s) to provide NASA with software products, traceability, software change tracking information and nonconformances in electronic format, including software development and management metrics.</td>
      <td>GitHub issues and pull requests</td>
    </tr>
    <tr>
      <td>3.1.10</td>
      <td>The project manager shall require the software developer(s) to provide NASA with electronic access to the source code developed for the project in a modifiable format.</td>
      <td>GitHub repositories</td>
    </tr>
    <tr>
      <td>3.1.11</td>
      <td>The project manager shall comply with the requirements in this NPR that are marked with an “X” in Appendix C consistent with their software classification.</td>
      <td>This table</td>
    </tr>
    <tr>
      <td>3.1.12</td>
      <td>Where approved, the project manager shall document and reflect the tailored requirement in the plans or procedures controlling the development, acquisition, and deployment of the affected software.</td>
      <td>No requirements tailored</td>
    </tr>
    <tr>
      <td>3.1.13</td>
      <td>Each project manager with software components shall maintain a requirements mapping matrix or multiple requirements mapping matrices against requirements in this NPR, including those delegated to other parties or accomplished by contract vehicles or Space Act Agreements.</td>
      <td>This table</td>
    </tr>
    <tr>
      <td>3.1.14</td>
      <td>
        The project manager shall satisfy the following conditions when a COTS, GOTS, MOTS, OSS, or reused software component is acquired or used:
        <ol type="a">
          <li>The requirements to be met by the software component are identified.</li>
          <li>The software component includes documentation to fulfill its intended purpose (e.g., usage instructions).</li>
          <li>Proprietary rights, usage rights, ownership, warranty, licensing rights, transfer rights, and conditions of use (e.g., required copyright, author, and applicable license notices within the software code, or a requirement to redistribute the licensed software only under the same license (e.g., GNU GPL, ver. 3, license)) have been addressed and coordinated with Center Intellectual Property Counsel.</li>
          <li>Future support for the software product is planned and adequate for project needs.</li>
          <li>The software component is verified and validated to the same level required to accept a similar developed software component for its intended use.</li>
          <li>The project has a plan to perform periodic assessments of vendor reported defects to ensure the defects do not impact the selected software components.</li>
        </ol>
      </td>
      <td>Prospective dependencies are reviewed in GitHub pull requests</td>
    </tr>
    <tr><td colSpan="3">Software Cost Estimation</td></tr>
    <tr>
      <td>3.2.1</td>
      <td>
        To better estimate the cost of development, the project manager shall establish, document, and maintain:
        <ol type="a">
          <li>Two cost estimate models and associated cost parameters for all Class A and B software projects that have an estimated project cost of $2 million or more.</li>
          <li>One software cost estimate model and associated cost parameter(s) for all Class A and Class B software projects that have an estimated project cost of less than $2 million.</li>
          <li>One software cost estimate model and associated cost parameter(s) for all Class C and Class D software projects.</li>
          <li>One software cost estimate model and associated cost parameter(s) for all Class F software projects.</li>
        </ol>
      </td>
      <td>Line count and COCOMO II cost model available upon request</td>
    </tr>
    <tr>
      <td>3.2.2</td>
      <td>
        The project manager’s software cost estimate(s) shall satisfy the following conditions:
        <ol type="a">
          <li>Covers the entire software life cycle.</li>
          <li>Is based on selected project attributes (e.g., programmatic assumptions/constraints, assessment of the size, functionality, complexity, criticality, reuse code, modified code, and risk of the software processes and products).</li>
          <li>Is based on the cost implications of the technology to be used and the required maturation of that technology.</li>
          <li>Incorporates risk and uncertainty, including end state risk and threat assessments for cybersecurity.</li>
          <li>Includes the cost of the required software assurance support.</li>
          <li>Includes other direct costs.</li>
        </ol>
      </td>
      <td>Factors provided as COCOMO II input parameters</td>
    </tr>
    <tr>
      <td>3.2.3</td>
      <td>The project manager shall submit software planning parameters, including size and effort estimates, milestones, and characteristics, to the Center measurement repository at the conclusion of major milestones.</td>
      <td>Upon request</td>
    </tr>
    <tr><td colSpan="3">Software Schedules</td></tr>
    <tr>
      <td>3.3.1</td>
      <td>
        The project manager shall document and maintain a software schedule that satisfies the following conditions:
        <ol type="a">
          <li>Coordinates with the overall project schedule.</li>
          <li>Documents the interactions of milestones and deliverables between software, hardware, operations, and the rest of the system.</li>
          <li>Reflects the critical dependencies for software development activities.</li>
          <li>Identifies and accounts for dependencies with other projects and cross-program dependencies.</li>
        </ol>
      </td>
      <td>Sprint planning, GitHub milestones</td>
    </tr>
    <tr>
      <td>3.3.3</td>
      <td>The project manager shall require the software developer(s) to provide a software schedule for the project’s review and schedule updates as requested.</td>
      <td>GitHub milestones</td>
    </tr>
    <tr><td colSpan="3">Software Classification Assessments</td></tr>
    <tr>
      <td>3.5.1</td>
      <td>The project manager shall classify each system and subsystem containing software in accordance with the highest applicable software classification definitions for Classes A, B, C, D, E, and F software in Appendix D.</td>
      <td>GCN and all of its dependencies are Class D.</td>
    </tr>
    <tr>
      <td>3.5.2</td>
      <td>The project manager shall maintain records of each software classification determination, each software Requirements Mapping Matrix, and the results of each software independent classification assessments for the life of the project.</td>
      <td>This table</td>
    </tr>
    <tr><td colSpan="3">Software Assurance and Software Independent Verification & Validation</td></tr>
    <tr>
      <td>3.6.1</td>
      <td>The project manager shall plan and implement software assurance, software safety, and IV&V (if required) per NASA-STD-8739.8, Software Assurance and Software Safety Standard.</td>
      <td>Not safety critical</td>
    </tr>
    <tr><td colSpan="3">Safety-critical Software</td></tr>
    <tr>
      <td>3.7.1</td>
      <td>The project manager, in conjunction with the SMA organization, shall determine if each software component is considered to be safety-critical per the criteria defined in NASA-STD-8739.8.</td>
      <td>Not safety critical</td>
    </tr>
    <tr><td colSpan="3">Automatic Generation of Software Source Code</td></tr>
    <tr>
      <td>3.8.2</td>
      <td>The project manager shall require the software developers and custom software suppliers to provide NASA with electronic access to the models, simulations, and associated data used as inputs for auto-generation of software.</td>
      <td>GitHub repositories</td>
    </tr>
    <tr><td colSpan="3">Software Reuse</td></tr>
    <tr>
      <td>3.10.1</td>
      <td>The project manager shall specify reusability requirements that apply to its software development activities to enable future reuse of the software, including the models, simulations, and associated data used as inputs for auto-generation of software, for U.S. Government purposes.</td>
      <td>Software is open source</td>
    </tr>
    <tr>
      <td>3.10.2</td>
      <td>
        The project manager shall evaluate software for potential reuse by other projects across NASA and contribute reuse candidates to the NASA Internal Sharing and Reuse Software systems, however, if the project manager is a contractor, then a civil servant must pre-approve all such software contributions; all software contributions should include, at a minimum, the following information:
        <ol type="a">
          <li>Software Title.</li>
          <li>Software Description.</li>
          <li>The Civil Servant Software Technical Point of Contact for the software product.</li>
          <li>The language or languages used to develop the software.</li>
          <li>Any third party code contained therein and the record of the requisite license or permission received from the third party permitting the Government’s use, if applicable.</li>
        </ol>
      </td>
      <td>Software is open source, indexed by applicable public package collections</td>
    </tr>
    <tr><td colSpan="3">Software Cybersecurity</td></tr>
    <tr>
      <td>3.11.2</td>
      <td>The project manager shall perform a software cybersecurity assessment on the software components per the Agency security policies and the project requirements, including risks posed by the use of COTS, GOTS, MOTS, OSS, or reused software components.</td>
      <td>Considered in review of new dependencies in GitHub pull requests. GitHub Dependabot alerts are enabled</td>
    </tr>
    <tr>
      <td>3.11.3</td>
      <td>The project manager shall identify cybersecurity risks, along with their mitigations, in flight and ground software systems and plan the mitigations for these systems.</td>
      <td>Considered in reviews of all GitHub pull requests</td>
    </tr>
    <tr>
      <td>3.11.4</td>
      <td>The project manager shall implement protections for software systems with communications capabilities against unauthorized access per the requirements contained in the Space System Protection Standard, NASA-STD-1006.</td>
      <td>Not applicable; no capabilities for communication with spacecraft</td>
    </tr>
    <tr>
      <td>3.11.5</td>
      <td>The project manager shall test the software and record test results for the required software cybersecurity mitigation implementations identified from the security vulnerabilities and security weaknesses analysis.</td>
      <td>GitHub code scanning enabled</td>
    </tr>
    <tr>
      <td>3.11.6</td>
      <td>The project manager shall identify, record, and implement secure coding practices.</td>
      <td>See, for example, [OWASP Secure Coding Practices](https://owasp.org/www-project-secure-coding-practices-quick-reference-guide/)</td>
    </tr>
    <tr>
      <td>3.11.7</td>
      <td>The project manager shall verify that the software code meets the project’s secure coding standard by using the results from static analysis tool(s).</td>
      <td>[CodeQL](https://docs.github.com/en/code-security/code-scanning/introduction-to-code-scanning/about-code-scanning-with-codeql)</td>
    </tr>
    <tr><td colSpan="3">Software Bi-Directional Traceability</td></tr>
    <tr>
      <td>3.12.1</td>
      <td>The project manager shall perform, record, and maintain bi-directional traceability between the following software elements: (See Table in 3.12.1)</td>
      <td>Unit tests and integration tests as needed</td>
    </tr>
    <tr><td colSpan="3">Software Requirements</td></tr>
    <tr>
      <td>4.1.2</td>
      <td>The project manager shall establish, capture, record, approve, and maintain software requirements, including requirements for COTS, GOTS, MOTS, OSS, or reused software components, as part of the technical specification.</td>
      <td>Informally, during sprint planning</td>
    </tr>
    <tr>
      <td>4.1.5</td>
      <td>The project manager shall track and manage changes to the software requirements.</td>
      <td>Acceptance criteria in GitHub issues</td>
    </tr>
    <tr>
      <td>4.1.6</td>
      <td>The project manager shall identify, initiate corrective actions, and track until closure inconsistencies among requirements, project plans, and software products.</td>
      <td>GitHub issues</td>
    </tr>
    <tr>
      <td>4.1.7</td>
      <td>The project manager shall perform requirements validation to ensure that the software will perform as intended in the customer environment.</td>
      <td>Unit tests and integration tests as needed</td>
    </tr>
    <tr><td colSpan="3">Software Implementation</td></tr>
    <tr>
      <td>4.4.3</td>
      <td>The project manager shall select, define, and adhere to software coding methods, standards, and criteria.</td>
      <td>These docs</td>
    </tr>
    <tr>
      <td>4.4.4</td>
      <td>The project manager shall use static analysis tools to analyze the code during the development and testing phases to, at a minimum, detect defects, software security, code coverage, and software complexity.</td>
      <td>[Codecov.io](https://codecov.io), [CodeQL](https://docs.github.com/en/code-security/code-scanning/introduction-to-code-scanning/about-code-scanning-with-codeql)</td>
    </tr>
    <tr>
      <td>4.4.5</td>
      <td>The project manager shall unit test the software code.</td>
      <td>e.g. [Jest](https://jestjs.io), [Pytest](https://pytest.org/)</td>
    </tr>
    <tr>
      <td>4.4.6</td>
      <td>The project manager shall assure that the unit test results are repeatable.</td>
      <td>[GitHub Actions](https://docs.github.com/en/actions/learn-github-actions/understanding-github-actions)</td>
    </tr>
    <tr>
      <td>4.4.7</td>
      <td>The project manager shall provide a software version description for each software release.</td>
      <td>[GitHub releases](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases)</td>
    </tr>
    <tr><td colSpan="3">Software Testing</td></tr>
    <tr>
      <td>4.5.2</td>
      <td>
        The project manager shall establish and maintain:
        <ol type="a">
          <li>Software test plan(s).</li>
          <li>Software test procedure(s).</li>
          <li>Software test(s), including any code specifically written to perform test procedures.</li>
          <li>Software test report(s).</li>
        </ol>
      </td>
      <td>These docs</td>
    </tr>
    <tr>
      <td>4.5.3</td>
      <td>The project manager shall test the software against its requirements.</td>
      <td>Unit tests and integration tests as needed</td>
    </tr>
    <tr>
      <td>4.5.5</td>
      <td>The project manager shall evaluate test results and record the evaluation.</td>
      <td>[GitHub Actions](https://docs.github.com/en/actions/learn-github-actions/understanding-github-actions)</td>
    </tr>
    <tr>
      <td>4.5.7</td>
      <td>The project manager shall update the software test and verification plan(s) and procedure(s) to be consistent with software requirements.</td>
      <td>These docs</td>
    </tr>
    <tr>
      <td>4.5.9</td>
      <td>The project manager shall ensure that the code coverage measurements for the software are selected, implemented, tracked, recorded, and reported.</td>
      <td>[Codecov.io](https://codecov.io)</td>
    </tr>
    <tr>
      <td>4.5.12</td>
      <td>The project manager shall verify through test the software requirements that trace to a hazardous event, cause, or mitigation technique.</td>
      <td>As a criterion in reivew of pull requests</td>
    </tr>
    <tr><td colSpan="3">Software Operations, Maintenance, and Retirement</td></tr>
    <tr>
      <td>4.6.2</td>
      <td>The project manager shall plan and implement software operations, maintenance, and retirement activities.</td>
      <td>These docs</td>
    </tr>
    <tr>
      <td>4.6.3</td>
      <td>The project manager shall complete and deliver the software product to the customer with appropriate records, including as-built records, to support the operations and maintenance phase of the software’s life cycle.</td>
      <td>E.g. [NPM](https://www.npmjs.com) and [PyPI](https://pypi.org) packages</td>
    </tr>
    <tr>
      <td>4.6.4</td>
      <td>The project manager shall complete, prior to delivery, verification that all software requirements identified for this delivery have been met or dispositioned, that all approved changes have been implemented and that all defects designated for resolution prior to delivery have been resolved.</td>
      <td>Unit tests, integration tests, [deployment stages](/docs/contributing/deployment#stages)</td>
    </tr>
    <tr>
      <td>4.6.5</td>
      <td>The project manager shall maintain the software using standards and processes per the applicable software classification throughout the maintenance phase.</td>
      <td>These docs</td>
    </tr>
    <tr>
      <td>4.6.6</td>
      <td>The project manager shall identify the records and software tools to be archived, the location of the archive, and procedures for access to the products for software retirement or disposal.</td>
      <td>https://github.com/nasa-gcn GitHub org</td>
    </tr>
    <tr><td colSpan="3">Software Configuration Management</td></tr>
    <tr>
      <td>5.1.2</td>
      <td>The project manager shall develop a software configuration management plan that describes the functions, responsibilities, and authority for the implementation of software configuration management for the project.</td>
      <td>These docs, GitHub</td>
    </tr>
    <tr>
      <td>5.1.3</td>
      <td>The project manager shall track and evaluate changes to software products.</td>
      <td>GitHub issues and pull requests</td>
    </tr>
    <tr>
      <td>5.1.4</td>
      <td>The project manager shall identify the software configuration items (e.g., software records, code, data, tools, models, scripts) and their versions to be controlled for the project.</td>
      <td>Everything is in GitHub</td>
    </tr>
    <tr>
      <td>5.1.5</td>
      <td>
        The project manager shall establish and implement procedures to:
        <ol type="a">
          <li>Designate the levels of control through which each identified software configuration item is required to pass.</li>
          <li>Identify the persons or groups with authority to authorize changes.</li>
          <li>Identify the persons or groups to make changes at each level.</li>
        </ol>
      </td>
      <td>[GitHub teams](https://docs.github.com/en/organizations/organizing-members-into-teams/about-teams)</td>
    </tr>
    <tr>
      <td>5.1.6</td>
      <td>The project manager shall prepare and maintain records of the configuration status of software configuration items.</td>
      <td>These docs</td>
    </tr>
    <tr>
      <td>5.1.7</td>
      <td>The project manager shall perform software configuration audits to determine the correct version of the software configuration items and verify that they conform to the records that define them.</td>
      <td>[Dependabot](https://docs.github.com/en/code-security/getting-started/dependabot-quickstart-guide)</td>
    </tr>
    <tr>
      <td>5.1.8</td>
      <td>The project manager shall establish and implement procedures for the storage, handling, delivery, release, and maintenance of deliverable software products.</td>
      <td>E.g. [NPM](https://www.npmjs.com) and [PyPI](https://pypi.org) packages</td>
    </tr>
    <tr><td colSpan="3">Software Non-conformance or Defect Management</td></tr>
    <tr>
      <td>5.5.1</td>
      <td>The project manager shall track and maintain software non-conformances (including defects in tools and appropriate ground software).</td>
      <td>GitHub issues</td>
    </tr>
  </tbody>
 </Table>

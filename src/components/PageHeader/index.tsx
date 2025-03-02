// SPDX-License-Identifier: MPL-2.0
// Copyright (C) 2019 - 2021 Gemeente Amsterdam
import styled from 'styled-components'

import { Heading, Paragraph, themeSpacing } from '@remcohoff/asc-ui'
import type { FunctionComponent } from 'react'

const StyledHeading = styled(Heading)`
  margin: 0;
`

const Section = styled.section`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
`

const SubTitle = styled(Paragraph)`
  margin: ${themeSpacing(3)} 0;
`

interface PageHeaderProps {
  className?: string
  subTitle?: string
  title: string
}

const PageHeader: FunctionComponent<PageHeaderProps> = ({
  className,
  subTitle,
  title,
}) => (
  <Section className={className}>
    <StyledHeading>{title}</StyledHeading>
    {subTitle && <SubTitle>{subTitle}</SubTitle>}
  </Section>
)

export default PageHeader

import React from 'react';
import nookies from 'nookies';
import jwt from 'jsonwebtoken';
import { useRouter } from 'next/router';

import MainGrid from '../src/components/MainGrid';
import Box from '../src/components/Box';
import { AlurakutMenu, AlurakutProfileSidebarMenuDefault, OrkutNostalgicIconSet } from '../src/lib/AlurakutCommons';
import { ProfileRelationsBoxWrapper } from '../src/components/ProfileRelations'

function ProfileSideBar(props) {
  return (
    <Box as="aside">
      <img src={`https://github.com/${props.githubUser}.png`} alt="User Profile" style={{ borderRadius: '8px' }} />
      <br />

      <p>
        <a className="boxLink" href={`http://github.com/${props.githubUser}`}>
          @{props.githubUser}
        </a>
      </p>
      <br />
      <AlurakutProfileSidebarMenuDefault />
    </Box>
  );
}

function ProfileRelationsBox({title, items}) {
  return (
    <ProfileRelationsBoxWrapper>
      <h2 className="smallTitle">
        {title} ({items.length})
      </h2>
      <ul>
        {/* { seguidores.map((itemAtual) => {
          return (
            <li key={itemAtual}>
              <a href={`https://github.com/${itemAtual}.png`}>
                <img src={itemAtual.image} />
                <span>{itemAtual.title}</span>
              </a>
            </li>
          )
        })
        }  */}
      </ul>
    </ProfileRelationsBoxWrapper>
  )
}

export default function Home({githubUser}) {
  const usuarioAleatorio = githubUser;
  const [comunidades, setComunidades] = React.useState([]);
  const router = useRouter();

  const pessoasFavoritas = [
    'filipedeschamps',
    'omariosouto',
    'maykbrito',
    'rafaballerini',
    'diego3g',
    'davidbombal'
  ];

  const [seguidores, setSeguidores] = React.useState([]);
  // 0 - Pegar o array de dados do github 
  React.useEffect(() => {
	const config = {
		per_page: 6,
		page: 1,
		order: 'desc'
	}
	
    // GET
    fetch(`https://api.github.com/users/${githubUser}/followers`+`?per_page=${config.per_page}&page=${config.page}&order=${config.order}`)
      .then((res) => {
        if (res.ok)
          return res.json();
        
        nookies.destroy(null, 'USER_TOKEN', {});
        router.push('/login');
        throw new Error(res.status)
      })
      .then((data) => {
        setSeguidores(data);
      }).catch((err) => {
        console.log(err, 'Usuário inválido');
        
      });

    // API GraphQL
    fetch('https://graphql.datocms.com/', {
      method: 'POST',
      headers: {
        'Authorization': 'ec21770165ff50159f4a8d6467cceb',
        //'Authorization': process.env.ONLYREAD_TOKEN_AUTHORIZATION,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        "query": `query {
        allCommunities {
          id 
          title
          imageUrl
          creatorSlug
        }
      }` })
    })
      .then((response) => response.json()) // Pega o retorno do response.json() e já retorna
      .then((respostaCompleta) => {
        const comunidadesVindasDoDato = respostaCompleta.data.allCommunities;
        console.log(comunidadesVindasDoDato)
        setComunidades(comunidadesVindasDoDato)
      });
    // .then(function (response) {
    //   return response.json()
    // })
  }, []);

  return (
    <>
      <AlurakutMenu githubUser={usuarioAleatorio} />
      <MainGrid>
        <div className="profileArea" style={{ gridArea: 'profileArea' }}>
          <ProfileSideBar githubUser={usuarioAleatorio} />
        </div>
        <div className="welcomeArea" style={{ gridArea: 'welcomeArea' }}>
          <Box>
            <h1 className='title'>
              Bem Vindo(a)
            </h1>
            <OrkutNostalgicIconSet />
          </Box>
          <Box>
            <h2 className="subtitle">O que você deseja fazer?</h2>
            <form onSubmit={(event) => {
              event.preventDefault()

              const dadosDoForm = new FormData(event.target);

              const comunidade = {
                title: dadosDoForm.get('title'),
                imageUrl: dadosDoForm.get('image'),
                creatorSlug: usuarioAleatorio,
              }

              fetch('/api/comunidades', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(comunidade)
              })
                .then(async (response) => {
                  const dados = await response.json();
                  const getComunidade = dados.registroCriado;
                  const comunidadesAtualizadas = [...comunidades, getComunidade];
                  setComunidades(comunidadesAtualizadas)
                })
            }}>
              <div>
                <input placeholder="Qual vai ser a sua curiosiade?" name="title" aria-label="Qual vai ser a sua curiosiade?" type="text" />
              </div>
              <div>
                <input placeholder="Coloque uma url para usarmos de capa" name="image" aria-label="Coloque uma url para usarmos de capa" />
              </div>

              <button>
                Criar comunidade
              </button>
            </form>
          </Box>
        </div>
        <div className="profileRelationArea" style={{ gridArea: 'profileRelationArea' }}>
          <ProfileRelationsBox title="Seguidores" items={seguidores} />
          <ProfileRelationsBoxWrapper>
            <h2 className="smallTitle">
              Comunidades ({comunidades.length})
            </h2>
            <ul>
              {comunidades.map((itemAtual) => {
                return (
                  <li key={itemAtual.id}>
                    <a href={`/communities/${itemAtual.id}`}>
                      {/* <img src={`http://placehold.it/300x300`} /> */}
                      {/* <img src={`https://picsum.photos/200/300`} /> */}

                      <img src={`${itemAtual.imageUrl}`} />
                      <span>{itemAtual.title}</span>

                    </a>
                  </li>
                )
              })}
            </ul>
          </ProfileRelationsBoxWrapper>
          <ProfileRelationsBoxWrapper>
            <h2 className="smallTitle">
              Pessoas da comunidade ({pessoasFavoritas.length})
            </h2>

            <ul>
              {pessoasFavoritas.map((itemAtual) => {
                return (
                  <li key={itemAtual}>
                    {//<a href={`/users/${itemAtual}`}>}
                    <a href={`https://github.com/${itemAtual}`}>
                      <img src={`https://github.com/${itemAtual}.png`} />
                      <span>{itemAtual}</span>
                    </a>
                  </li>
                )
              })}
            </ul>
          </ProfileRelationsBoxWrapper>
        </div>
      </MainGrid>
    </>
  );
}

export async function getServerSideProps(context) {
  const cookies = nookies.get(context)
  const token = cookies.USER_TOKEN;
  const { isAuthenticated } = await fetch('https://alurakut.vercel.app/api/auth', {
    headers: {
        Authorization: token
      }
  })
  .then((resposta) => resposta.json())

  if(!isAuthenticated) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      }
    }
  }

  const { githubUser } = jwt.decode(token);
  return {
    props: {
      githubUser
    }, // will be passed to the page component as props
  }
}
